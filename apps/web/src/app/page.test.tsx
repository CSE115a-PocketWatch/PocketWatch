
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('Home Page', () => {
  it('renders the homepage', () => {
    render(<Home />);

    expect(document.body).not.toBeEmptyDOMElement();
  });
});

