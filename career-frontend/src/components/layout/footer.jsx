import React from 'react';
export default function Footer() {
  return (
    <footer className="bg-white border-top py-4 mt-auto">
      {/* Changed to container-xxl to match alignment */}
      <div className="container-xxl text-center text-lg-start d-flex justify-content-between align-items-center">
        <p className="mb-0 text-secondary small">
          &copy; {new Date().getFullYear()} CareerPaths. All rights reserved.
        </p>
      </div>
    </footer>
  );

}

