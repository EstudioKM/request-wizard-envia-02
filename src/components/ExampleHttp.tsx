
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { http, useGet } from '@/lib/http-client';
import { toast } from '@/components/ui/use-toast';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const ExampleHttp = () => {
  const [postId, setPostId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [manualPost, setManualPost] = useState<Post | null>(null);

  // Ejemplo usando el hook useGet
  const { data: post, isLoading, error, refetch } = useGet<Post>(
    postId ? `https://jsonplaceholder.typicode.com/posts/${postId}` : null,
    {
      enabled: !!postId,
      onSuccess: (data) => {
        toast({
          title: 'Post cargado correctamente',
          description: `Se cargó el post: ${data.title}`,
        });
      },
      onError: (err) => {
        toast({
          variant: 'destructive',
          title: 'Error al cargar el post',
          description: err.message,
        });
      },
    }
  );

  // Ejemplo usando directamente el cliente HTTP
  const handleFetchManually = async () => {
    try {
      setLoading(true);
      const response = await http.get<Post>(`https://jsonplaceholder.typicode.com/posts/${postId}`);
      setManualPost(response.data);
      toast({
        title: 'Post cargado manualmente',
        description: `Se cargó el post: ${response.data.title}`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar el post manualmente',
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Ejemplo de HTTP Client</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>useGet Hook (React Query)</CardTitle>
              <CardDescription>
                Ejemplo usando el hook useGet que combina React Query con nuestro cliente HTTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="postId" className="block text-sm font-medium mb-1">
                  ID del Post:
                </label>
                <Input
                  id="postId"
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  placeholder="Ingrese el ID del post"
                />
              </div>
              
              {isLoading ? (
                <div className="animate-pulse h-20 bg-gray-100 rounded-md"></div>
              ) : error ? (
                <div className="text-red-500">Error: {(error as Error).message}</div>
              ) : post ? (
                <div className="border p-3 rounded-md">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{post.body}</p>
                </div>
              ) : (
                <div className="text-gray-500">No hay datos para mostrar</div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Recargar datos'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Cliente HTTP Directo</CardTitle>
              <CardDescription>
                Ejemplo usando directamente el cliente HTTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="manualPostId" className="block text-sm font-medium mb-1">
                  ID del Post:
                </label>
                <Input
                  id="manualPostId"
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  placeholder="Ingrese el ID del post"
                />
              </div>
              
              {loading ? (
                <div className="animate-pulse h-20 bg-gray-100 rounded-md"></div>
              ) : manualPost ? (
                <div className="border p-3 rounded-md">
                  <h3 className="font-semibold">{manualPost.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{manualPost.body}</p>
                </div>
              ) : (
                <div className="text-gray-500">No hay datos para mostrar</div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleFetchManually} disabled={loading}>
                {loading ? 'Cargando...' : 'Cargar datos manualmente'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExampleHttp;
