import React from "react";
import DOMPurify from "dompurify";

function StaticText({ value }) {
    // Sanitize the HTML content to prevent XSS attacks
    console.log("htmlContent:", value);
    const sanitizedHtml = DOMPurify.sanitize(value);

    return <div className="safe-html" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

export default StaticText;