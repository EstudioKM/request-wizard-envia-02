
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Save, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface JsonViewerProps {
  data: any;
  onUpdate?: (newData: any) => void;
  isEditable?: boolean;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, onUpdate, isEditable = false }) => {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const startEditing = (path: string, value: any) => {
    if (!isEditable) return;
    setEditingPath(path);
    setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
  };

  const saveEdit = (path: string) => {
    if (!onUpdate) return;

    try {
      // Try to parse as JSON if possible
      let newValue;
      try {
        newValue = JSON.parse(editValue);
      } catch {
        // If it's not valid JSON, use the raw value
        newValue = editValue;
      }

      // Create a deep copy of the data
      const newData = JSON.parse(JSON.stringify(data));
      
      // Navigate to the correct path and update the value
      const pathParts = path.split('.');
      let current = newData;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = newValue;
      
      // Update the data
      onUpdate(newData);
    } catch (error) {
      console.error("Error updating value:", error);
    }
    
    setEditingPath(null);
  };

  const cancelEdit = () => {
    setEditingPath(null);
  };

  const renderValue = (value: any, path: string, depth: number = 0) => {
    if (value === null) {
      return <span className="text-gray-500 italic">null</span>;
    }

    if (value === undefined) {
      return <span className="text-gray-500 italic">undefined</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-600">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-green-600">{value}</span>;
    }

    if (typeof value === 'string') {
      if (editingPath === path) {
        return (
          <div className="flex items-center space-x-2">
            <Input 
              value={editValue} 
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1"
            />
            <Button size="icon" variant="ghost" onClick={() => saveEdit(path)}><Save size={16} /></Button>
            <Button size="icon" variant="ghost" onClick={cancelEdit}><X size={16} /></Button>
          </div>
        );
      }
      
      return (
        <div className="flex items-center group">
          <span className="text-amber-600">"{value}"</span>
          {isEditable && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2" 
              onClick={() => startEditing(path, value)}
            >
              <Edit size={14} />
            </Button>
          )}
        </div>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }

      const isExpanded = expandedPaths[path] !== false;
      
      return (
        <div>
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => toggleExpand(path)}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="text-gray-700 font-medium">[{value.length}]</span>
          </div>
          
          {isExpanded && (
            <div className="pl-4 border-l border-gray-200 ml-2 space-y-1">
              {value.map((item, index) => (
                <div key={`${path}.${index}`} className="flex">
                  <span className="text-gray-500 mr-2">{index}:</span>
                  {renderValue(item, `${path}.${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      
      if (keys.length === 0) {
        return <span className="text-gray-500">{"{}"}</span>;
      }

      const isExpanded = expandedPaths[path] !== false;
      
      return (
        <div>
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => toggleExpand(path)}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="text-gray-700 font-medium">{"{}"}</span>
          </div>
          
          {isExpanded && (
            <div className="pl-4 border-l border-gray-200 ml-2 space-y-1">
              {keys.map(key => (
                <div key={`${path}.${key}`} className="flex">
                  <span className="text-purple-600 mr-2">"{key}":</span>
                  {renderValue(value[key], `${path}.${key}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  const renderJsonObject = () => {
    if (typeof data !== 'object' || data === null) {
      return renderValue(data, 'root');
    }

    return (
      <div className="space-y-2">
        {Object.keys(data).map(key => (
          <div key={key} className="flex">
            <span className="text-purple-600 mr-2">"{key}":</span>
            {renderValue(data[key], key)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6 font-mono text-sm overflow-auto max-h-[500px]">
        {renderJsonObject()}
      </CardContent>
    </Card>
  );
};

export default JsonViewer;
