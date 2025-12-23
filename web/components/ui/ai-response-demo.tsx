'use client';
import { Response } from '@/components/ui/shadcn-io/ai/response';
import { useEffect, useState } from 'react';
import { useDemoStore } from '../store/demo-store';
import { Card } from './card';

const AIResponseDemo = () => {
  const response = useDemoStore((s) => s.response);
  return (
    <div className="w-full">
      {response !== "" && (
        <Card className="overflow-y-auto p-6 rounded-lg">
          <Response>
            {response}
          </Response>
        </Card>
      )}
    </div>
  );
};

export default AIResponseDemo;
