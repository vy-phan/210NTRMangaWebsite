import React, { useState } from 'react';

export const PLACEHOLDER_COVER = '/place-doro.webp';

interface FallbackImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

// Ảnh có fallback: src rỗng hoặc load lỗi -> /place-doro.webp
const FallbackImg: React.FC<FallbackImgProps> = ({ src, alt = '', onError, ...rest }) => {
  const [failed, setFailed] = useState(false);
  const finalSrc = !src || failed ? PLACEHOLDER_COVER : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...rest}
      onError={(e) => {
        if (!failed) {
          setFailed(true);
        } else {
          onError?.(e);
        }
      }}
    />
  );
};

export default FallbackImg;
