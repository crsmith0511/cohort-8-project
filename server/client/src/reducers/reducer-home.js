import { FETCH_HOME } from '../actions/types';

//hard code the initial state to see groups!!!!
const INITIAL_STATE = []
//NEED TO DO
export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_HOME :
      return action.payload
    default:
      return state;
  }
}