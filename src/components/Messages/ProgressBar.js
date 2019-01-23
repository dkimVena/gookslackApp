import React from 'react';

import { Progress } from 'semantic-ui-react';

const ProgressBar = ({ uploadState, percentUploaded }) =>
  uploadState === 'uploading' && (
    <Progress
      className="progress__bar"
      inverted
      percent={percentUploaded}
      size="medium"
      progress
      indicating
    />
  );

export default ProgressBar;
