import { FileViewer } from '@/components/FileViewer';

// Fichiers de test
const testFiles = [
  {
    name: 'Document PDF',
    url: '/sample.pdf',
    type: 'application/pdf'
  },
  {
    name: 'Document Word',
    url: '/sample.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  {
    name: 'Image',
    url: 'https://picsum.photos/800/800?random=1',
    type: 'image/jpeg'
  },
  {
    name: 'Modèle 3D',
    url: '/sample.ifc',
    type: 'model/ifc'
  }
];

export default function ViewerPage() {
  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Visionneuse universelle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testFiles.map((file, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <h3 className="font-medium mb-2">{file.name}</h3>
            <p className="text-sm text-muted-foreground">{file.type}</p>
          </div>
        ))}
      </div>
    </main>
  );
} 