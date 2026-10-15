import React from 'react';

// Shared proportions keep the symbols centred independently of platform fonts.
const symbols = {
    '♀': <>
        <circle cx="16" cy="11" r="7" />
        <path d="M16 18v10M11 23h10" />
    </>,
    '⚥': <g transform="translate(-0.5 0)">
        <circle cx="14" cy="14" r="7" />
        <path d="M14 21v9M9 25h10M19 9 26 2M20 2h6v6" />
    </g>,
    '♂': <>
        <circle cx="12" cy="20" r="7" />
        <path d="m17 15 10-10M21 5h6v6" />
    </>,
};

const Emoji = ({ symbol, label }) => (
    <svg
        className="emoji"
        viewBox="0 0 32 32"
        role="img"
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
    >
        {symbols[symbol]}
    </svg>
);
export default Emoji;
