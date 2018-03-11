export const a = (href, content) => `
  <a href="${href}">
    ${content}
  </a>
`;

export const li = content => `
  <li>
    ${content}
  </li>
`;

export const ul = items => `
  <ul>
    ${items.map(li).join('')}
  </ul>
`;

export const h1 = content => `
  <h1>${content}</h1>
`;
