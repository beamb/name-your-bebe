import React from 'react';
import { ThreeDots } from 'react-loader-spinner';

const LoadingIndicator = ({ loading }) => (
  loading ? <ThreeDots color="#000000" ariaLabel="Loading names" /> : null
);

export default LoadingIndicator;
