import React from "react";
import { FestivalCalendarContainer } from "../../features/calendar/containers/FestivalCalendarContainer";

/**
 * Admin FestivalCalendarView Wrapper
 * Delegates rendering to FestivalCalendarContainer for clean separation of concerns.
 */
export const FestivalCalendarView = (props) => {
  return <FestivalCalendarContainer {...props} />;
};

export default FestivalCalendarView;
