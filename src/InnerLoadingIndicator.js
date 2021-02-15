import React from 'react';
import { usePromiseTracker } from "react-promise-tracker";
import Loader from 'react-loader-spinner';

 
const LoadingIndicator = props => {
    const { promiseInProgress } = usePromiseTracker();
   return (
    promiseInProgress && 
      <Loader type="ThreeDots" color="#000000" />
  );  
 }

export default LoadingIndicator;