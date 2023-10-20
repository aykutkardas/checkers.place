'use client';
import { useEffect, useState } from 'react';

import { copyToClipboard } from '@/helpers';

const COPY_TEXT_DEFAULT = 'Click to copy link';

const Invite = () => {
  const [copyText, setCopyText] = useState(COPY_TEXT_DEFAULT);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window?.location?.href?.split('?')[0]);
  }, []);

  const copyURL = async () => {
    await copyToClipboard(url);
    setCopyText('Copied!');
    setTimeout(() => setCopyText(COPY_TEXT_DEFAULT), 2000);
  };

  return (
    <div onClick={copyURL} className="inline-flex mt-10 md:mt-0 mx-auto flex-col items-center justify-start px-4 z-50">
      <div className="link overflow-hidden text-xs  max-w-[500px] px-3 text-ellipsis mb-1">{url}</div>
      <p className="text-center text-xs text-white/80">Send this link to your rival to connect.</p>
      <div className="copy-text mt-3">{copyText}</div>
    </div>
  );
};

export default Invite;
