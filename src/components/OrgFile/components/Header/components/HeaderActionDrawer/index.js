import React, { PureComponent } from 'react';

import './stylesheet.css';

export default class HeaderActionDrawer extends PureComponent {
  // A nasty hack required to get click handling to work properly in Firefox. No idea why its
  // broken in the first place or why this fixes it.
  iconWithFFClickCatcher(className, onClick) {
    return (
      <div onClick={onClick} className="header-action-drawer__ff-click-catcher-container">
        <div className="header-action-drawer__ff-click-catcher" />
        <i className={className} />
      </div>
    );
  }

  render() {
    const {
      onEnterTitleEditMode,
      onEnterDescriptionEditMode,
      onTagsClick,
      isFocused,
      onFocus,
      onUnfocus,
      onAddNewHeader,
      onDeadlineClick,
      onScheduledClick,
    } = this.props;

    return (
      <div className="header-action-drawer-container">
        <div className="header-action-drawer__row">
          {this.iconWithFFClickCatcher('fas fa-pencil-alt fa-lg', onEnterTitleEditMode)}

          <span className="header-action-drawer__separator" />

          {this.iconWithFFClickCatcher('fas fa-edit fa-lg', onEnterDescriptionEditMode)}

          <span className="header-action-drawer__separator" />

          {this.iconWithFFClickCatcher('fas fa-tags fa-lg', onTagsClick)}

          <span className="header-action-drawer__separator" />

          {isFocused
            ? this.iconWithFFClickCatcher('fas fa-expand fa-lg', onUnfocus)
            : this.iconWithFFClickCatcher('fas fa-compress fa-lg', onFocus)}

          <span className="header-action-drawer__separator" />

          {this.iconWithFFClickCatcher('fas fa-plus fa-lg', onAddNewHeader)}
          <div
            className="header-action-drawer__deadline-scheduled-button"
            onClick={onDeadlineClick}
          >
            Deadline
          </div>
          <span className="header-action-drawer__separator" />

          <div
            className="header-action-drawer__deadline-scheduled-button"
            onClick={onScheduledClick}
          >
            Scheduled
          </div>
        </div>
      </div>
    );
  }
}
