import { Project } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Folder } from 'lucide-react';

interface ProjectFilesTabProps {
  project: Project;
}

export function ProjectFilesTab({}: ProjectFilesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Project Files
        </h3>
        <Button size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>

      <Card className="p-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Folder className="w-12 h-12 text-slate-300" />
            <FileText className="w-12 h-12 text-slate-300" />
          </div>
          <div>
            <p className="text-slate-600 font-medium mb-2">
              File management coming soon
            </p>
            <p className="text-sm text-slate-500">
              Upload and organize project assets, documents, and deliverables
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First File
          </Button>
        </div>
      </Card>
    </div>
  );
}
