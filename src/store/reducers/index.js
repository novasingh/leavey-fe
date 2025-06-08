import { combineReducers } from '@reduxjs/toolkit'

import placeholderReducer from '../placeholderSlice';

const rootReducer = combineReducers({
  placeholder: placeholderReducer,
})

export default rootReducer;
