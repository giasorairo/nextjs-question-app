import { NextApiRequest, NextApiResponse } from 'next';
import react from 'react';
import ogpSvg from '../../../../svg/ogp';
import sharp from 'sharp';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const svg = `<?xml version="1.0"?>
    <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 1200 630" width="1200" height="630" fill="lightgray">
    <rect x="0" y="0" width="600" height="315" fill="blue" />
    <circle cx="300" cy="157" r="50" fill="none" stroke="red" stroke-width="10" />
    </svg>`;

  // res.writeHead
  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    // 'Content-Type': 'image/png',
    // 'Content-Length': buffer.length,
  })

  res.end(svg, 'binary');
};