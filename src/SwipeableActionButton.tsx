import React, { ReactElement, ReactNode } from "react";
import { SWIPEABLE_ACTION_WIDTH } from "./SwipeableAction";
import "./swipeableActionButton.css";

interface Props {
  icon: ReactNode;
  text?: ReactNode;
  onAction?: () => void;
}

export const SwipeableActionButton = ({
  icon,
  text,
  onAction,
}: Props): ReactElement => {
  function handleClick() {
    if (onAction) onAction();
  }

  return (
    <button
      type="button"
      className="swipeable-action-button"
      style={{ width: SWIPEABLE_ACTION_WIDTH }}
      onClick={handleClick}
    >
      <span className="swipeable-action-button__icon">{icon}</span>
      {text && <span className="swipeable-action-button__text">{text}</span>}
    </button>
  );
};
