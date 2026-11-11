import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';

// Avatar user: ảnh avatarUrl nếu có, ngược lại chữ cái đầu / icon người
const UserAvatar: React.FC<{
  user?: UserProfile | null;
  size?: number;
  className?: string;
}> = ({ user, size = 32, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  React.useEffect(() => setImgFailed(false), [user?.avatarUrl]);
  const style = { width: size, height: size };

  if (user?.avatarUrl && !imgFailed) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.displayName || 'Avatar'}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={style}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <span
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}
      style={{
        ...style,
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        fontSize: Math.round(size * 0.45),
      }}
      aria-hidden="true"
    >
      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <FiUser size={Math.round(size * 0.55)} />}
    </span>
  );
};

export default UserAvatar;
