export function productMatches(producto: any, searchQuery: string): boolean {
  const query = searchQuery.toLowerCase();
  
  return (
    producto.nombre?.toLowerCase().includes(query) ||
    producto.descripcion?.toLowerCase().includes(query) ||
    producto.marca?.toLowerCase().includes(query) ||
    producto.sku?.toLowerCase().includes(query) ||
    producto.caracteristicas?.some((c: string) => c.toLowerCase().includes(query))
  );
}

export function blogMatches(blog: any, searchQuery: string): boolean {
  const query = searchQuery.toLowerCase();
  
  return (
    blog.titulo?.toLowerCase().includes(query) ||
    blog.contenido?.toLowerCase().includes(query) ||
    blog.etiquetas?.some((t: string) => t.toLowerCase().includes(query)) ||
    blog.autor?.toLowerCase().includes(query)
  );
}
