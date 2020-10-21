/* This isnt the prettiest solution but since moment is supplied from the LMS and not us,
   it solves the issue where 'moment is not defined' when running tests
*/
window.moment = {};
window.moment.relativeTimeThreshold = () => null;
window.moment.relativeTimeRounding = () => null;
