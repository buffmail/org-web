import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import './stylesheet.css';

import PlanningItems from './components/PlanningItems';
import PropertyListItems from './components/PropertyListItems';

import _ from 'lodash';

import * as orgActions from '../../../../actions/org';
import * as baseActions from '../../../../actions/base';

import { renderAsText, getCurrentTimestampAsText } from '../../../../lib/timestamps';
import { attributedStringToRawText } from '../../../../lib/export_org';

import AttributedString from '../AttributedString';

class HeaderContent extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'handleRef',
      'handleTextareaRef',
      'handleDescriptionChange',
      'handleTableCellSelect',
      'handleExitTableEditMode',
      'handleTableCellValueUpdate',
      'handleEnterTableEditMode',
      'handleAddNewTableRow',
      'handleRemoveTableRow',
      'handleAddNewTableColumn',
      'handleRemoveTableColumn',
      'handleCheckboxClick',
      'handleListItemSelect',
      'handleEnterListTitleEditMode',
      'handleExitListTitleEditMode',
      'handleListTitleValueUpdate',
      'handleEnterListContentsEditMode',
      'handleExitListContentsEditMode',
      'handleListContentsValueUpdate',
      'handleAddNewListItem',
      'handleRemoveListItem',
      'handleTimestampClick',
      'handleInsertTimestamp',
      'handlePlanningItemTimestampClick',
      'handlePropertyListEdit',
    ]);

    this.state = {
      descriptionValue: this.calculateRawDescription(props.header),
      containerWidth: null,
    };
  }

  storeContainerWidth() {
    if (this.containerDiv) {
      this.setState({ containerWidth: this.containerDiv.offsetWidth });
    }
  }

  componentDidMount() {
    this.storeContainerWidth();
  }

  componentDidUpdate(prevProps) {
    const { header } = this.props;

    if (prevProps.inEditMode && !this.props.inEditMode) {
      this.props.org.updateHeaderDescription(header.get('id'), this.state.descriptionValue);
    }

    if (prevProps.header !== this.props.header) {
      this.setState(
        {
          descriptionValue: this.calculateRawDescription(this.props.header),
        },
        () => this.storeContainerWidth()
      );
    }
  }

  calculateRawDescription(header) {
    const planningItems = header.get('planningItems');
    const propertyListItems = header.get('propertyListItems');

    const planningItemsText = planningItems
      .map(
        planningItem =>
          `${planningItem.get('type')}: ${renderAsText(planningItem.get('timestamp'))}`
      )
      .join(' ');

    let propertyListItemsText = '';
    if (propertyListItems.size > 0) {
      propertyListItemsText += ':PROPERTIES:\n';
      propertyListItemsText += propertyListItems
        .map(
          propertyListItem =>
            `:${propertyListItem.get('property')}: ${attributedStringToRawText(
              propertyListItem.get('value')
            )}`
        )
        .join('\n');
      propertyListItemsText += '\n:END:';
    }

    let descriptionText = '';
    if (!!planningItemsText) {
      descriptionText += planningItemsText + '\n';
    }
    if (!!propertyListItemsText) {
      descriptionText += propertyListItemsText + '\n';
    }
    descriptionText += header.get('rawDescription');
    return descriptionText;
  }

  handleTextareaRef(textarea) {
    this.textarea = textarea;
  }

  handleRef(div) {
    this.containerDiv = div;
  }

  handleDescriptionChange(event) {
    this.setState({ descriptionValue: event.target.value });
  }

  handleTableCellSelect(cellId) {
    this.props.org.setSelectedTableCellId(cellId);
  }

  handleExitTableEditMode() {
    this.props.org.exitEditMode();
  }

  handleTableCellValueUpdate(cellId, newValue) {
    this.props.org.updateTableCellValue(cellId, newValue);
  }

  handleEnterTableEditMode() {
    this.props.org.enterEditMode('table');
  }

  handleAddNewTableRow() {
    this.props.org.addNewTableRow();
  }

  handleRemoveTableRow() {
    this.props.org.removeTableRow();
  }

  handleAddNewTableColumn() {
    this.props.org.addNewTableColumn();
  }

  handleRemoveTableColumn() {
    this.props.org.removeTableColumn();
  }

  handleCheckboxClick(listItemId) {
    this.props.org.advanceCheckboxState(listItemId);
  }

  handleListItemSelect(listItemId) {
    this.props.org.setSelectedListItemId(listItemId);
  }

  handleEnterListTitleEditMode() {
    this.props.org.enterEditMode('list-title');
  }

  handleExitListTitleEditMode() {
    this.props.org.exitEditMode();
  }

  handleListTitleValueUpdate(listItemId, newValue) {
    this.props.org.updateListTitleValue(listItemId, newValue);
  }

  handleEnterListContentsEditMode() {
    this.props.org.enterEditMode('list-contents');
  }

  handleExitListContentsEditMode() {
    this.props.org.exitEditMode();
  }

  handleListContentsValueUpdate(listItemId, newValue) {
    this.props.org.updateListContentsValue(listItemId, newValue);
  }

  handleAddNewListItem() {
    this.props.org.addNewListItemAndEdit();
  }

  handleRemoveListItem() {
    this.props.org.removeListItem();
  }

  handleTimestampClick(timestampId) {
    this.props.base.activatePopup('timestamp-editor', { timestampId });
  }

  handleInsertTimestamp(e) {
    e.preventDefault();

    const { descriptionValue } = this.state;
    const insertionIndex = this.textarea.selectionStart;
    const timestamp = getCurrentTimestampAsText();
    const newCursorPos = insertionIndex + timestamp.length;
    const newText =
      descriptionValue.substring(0, insertionIndex) +
      timestamp +
      descriptionValue.substring(this.textarea.selectionEnd || insertionIndex);
    this.setState({ descriptionValue: newText }, () => {
      this.textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  handlePlanningItemTimestampClick(headerId) {
    return planningItemIndex =>
      this.props.base.activatePopup('timestamp-editor', { headerId, planningItemIndex });
  }

  handlePropertyListEdit() {
    const { header } = this.props;
    this.props.base.activatePopup('property-list-editor', { headerId: header.get('id') });
  }

  render() {
    const {
      header,
      inEditMode,
      selectedTableCellId,
      inTableEditMode,
      shouldDisableActions,
      selectedListItemId,
      inListTitleEditMode,
      inListContentsEditMode,
    } = this.props;
    const { containerWidth } = this.state;

    if (!header.get('opened')) {
      return <div />;
    }

    const startWhitespaces = this.state.descriptionValue.match(/^\s*/);
    const indentStr = startWhitespaces ? startWhitespaces[0] : '';

    return (
      <div
        className="header-content-container nice-scroll"
        ref={this.handleRef}
        style={{ width: containerWidth }}
      >
        {inEditMode ? (
          <div className="header-content__edit-container">
            <textarea
              autoFocus
              className="textarea"
              rows={Math.min(10, this.state.descriptionValue.split('\n').length)}
              ref={this.handleTextareaRef}
              value={this.state.descriptionValue}
              onChange={this.handleDescriptionChange}
              onFocus={e => {
                const target = e.target;
                setTimeout(() => {
                  target.scrollTop = target.scrollHeight;
                }, 0);
              }}
              onKeyDown={e => {
                const target = e.target;
                if (target && e.key === 'Enter') {
                  e.preventDefault();
                  const currentContent = target.value;
                  const caretPosition = target.selectionStart;
                  const beforeText = currentContent.substring(0, caretPosition);
                  const afterText = currentContent.substring(caretPosition);
                  const newlineText = '\n' + indentStr;
                  const newValue = beforeText + newlineText + afterText;
                  target.value = newValue;
                  target.setSelectionRange(
                    caretPosition + newlineText.length,
                    caretPosition + newlineText.length
                  );
                  if (afterText.length === 0) {
                    target.scrollTop = target.scrollHeight;
                  }

                  this.setState({ descriptionValue: newValue });
                }
              }}
            />
            <div
              className="header-content__insert-timestamp-button"
              onMouseDown={this.handleInsertTimestamp}
            >
              <i className="fas fa-plus insert-timestamp-icon" />
              Insert timestamp
            </div>
          </div>
        ) : (
          <Fragment>
            <PlanningItems
              planningItems={header.get('planningItems')}
              onClick={this.handlePlanningItemTimestampClick(header.get('id'))}
            />
            <PropertyListItems
              propertyListItems={header.get('propertyListItems')}
              onTimestampClick={this.handleTimestampClick}
              shouldDisableActions={shouldDisableActions}
              onEdit={this.handlePropertyListEdit}
            />
            <AttributedString
              parts={header.get('description')}
              subPartDataAndHandlers={{
                onTableCellSelect: this.handleTableCellSelect,
                selectedTableCellId: selectedTableCellId,
                inTableEditMode: inTableEditMode,
                onExitTableEditMode: this.handleExitTableEditMode,
                onTableCellValueUpdate: this.handleTableCellValueUpdate,
                onEnterTableEditMode: this.handleEnterTableEditMode,
                onAddNewTableRow: this.handleAddNewTableRow,
                onRemoveTableRow: this.handleRemoveTableRow,
                onAddNewTableColumn: this.handleAddNewTableColumn,
                onRemoveTableColumn: this.handleRemoveTableColumn,
                onCheckboxClick: this.handleCheckboxClick,
                onListItemSelect: this.handleListItemSelect,
                onEnterListTitleEditMode: this.handleEnterListTitleEditMode,
                onExitListTitleEditMode: this.handleExitListTitleEditMode,
                onListTitleValueUpdate: this.handleListTitleValueUpdate,
                onEnterListContentsEditMode: this.handleEnterListContentsEditMode,
                onExitListContentsEditMode: this.handleExitListContentsEditMode,
                onListContentsValueUpdate: this.handleListContentsValueUpdate,
                onAddNewListItem: this.handleAddNewListItem,
                onRemoveListItem: this.handleRemoveListItem,
                selectedListItemId: selectedListItemId,
                inListTitleEditMode: inListTitleEditMode,
                inListContentsEditMode: inListContentsEditMode,
                onTimestampClick: this.handleTimestampClick,
                shouldDisableActions,
              }}
            />
          </Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    inEditMode:
      state.org.present.get('editMode') === 'description' &&
      state.org.present.get('selectedHeaderId') === props.header.get('id'),
    isSelected: state.org.present.get('selectedHeaderId') === props.header.get('id'),
    selectedTableCellId: state.org.present.get('selectedTableCellId'),
    inTableEditMode: state.org.present.get('editMode') === 'table',
    selectedListItemId: state.org.present.get('selectedListItemId'),
    inListTitleEditMode: state.org.present.get('editMode') === 'list-title',
    inListContentsEditMode: state.org.present.get('editMode') === 'list-contents',
  };
};

const mapDispatchToProps = dispatch => {
  return {
    org: bindActionCreators(orgActions, dispatch),
    base: bindActionCreators(baseActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderContent);
