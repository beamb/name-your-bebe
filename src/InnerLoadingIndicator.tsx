import { ThreeDots } from 'react-loader-spinner';

interface LoadingIndicatorProps {
  loading: boolean;
}

const LoadingIndicator = ({ loading }: LoadingIndicatorProps) => (
  loading ? <ThreeDots color="#000000" ariaLabel="Loading names" /> : null
);

export default LoadingIndicator;
