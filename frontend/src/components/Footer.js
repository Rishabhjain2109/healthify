
import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} Healthify. All rights reserved.</p>
    </footer>
  );
}

const styles = {
  footer: {
    textAlign: 'center',
    padding: '20px',
    borderTop: '1px solid #ddd',
    marginTop: '40px',
    background: '#f9f9f9',
    position: 'relative',
    bottom: 0,
    width: '100%'
  }
};
