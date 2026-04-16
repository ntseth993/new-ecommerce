import { useState } from "react";
import { useListProducts, useListCategories, ListProductsSort } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { ProductCard } from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Products() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const categoryParam = searchParams.get("category") || "";
  const sortParam = (searchParams.get("sort") as ListProductsSort) || ListProductsSort.popular;
  const qParam = searchParams.get("search") || "";
  
  const [searchInput, setSearchInput] = useState(qParam);

  const { data: categories } = useListCategories();
  
  const { data: productsPage, isLoading, isError } = useListProducts({
    category: categoryParam || undefined,
    sort: sortParam,
    search: qParam || undefined,
    limit: 20
  });

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchString);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when changing filters
    newParams.delete("page");
    setLocation(`/products?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setLocation("/products");
  };

  const hasActiveFilters = categoryParam || qParam || sortParam !== ListProductsSort.popular;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">All Products</h1>
          <p className="text-muted-foreground">
            {productsPage ? `${productsPage.total} items found` : "Loading..."}
          </p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-card"
            />
          </form>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters & Sort</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Sort By</h3>
                  <Select value={sortParam} onValueChange={(val) => updateFilters("sort", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ListProductsSort.popular}>Most Popular</SelectItem>
                      <SelectItem value={ListProductsSort.newest}>Newest Arrivals</SelectItem>
                      <SelectItem value={ListProductsSort.price_asc}>Price: Low to High</SelectItem>
                      <SelectItem value={ListProductsSort.price_desc}>Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Category</h3>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant={!categoryParam ? "default" : "outline"} 
                      className="justify-start" 
                      onClick={() => updateFilters("category", "")}
                    >
                      All Categories
                    </Button>
                    {categories?.map(c => (
                      <Button 
                        key={c.id}
                        variant={categoryParam === c.slug ? "default" : "outline"} 
                        className="justify-start"
                        onClick={() => updateFilters("category", c.slug)}
                      >
                        {c.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <SheetClose asChild>
                    <Button variant="destructive" className="w-full mt-4" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-24 self-start">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Sort By</h3>
            <Select value={sortParam} onValueChange={(val) => updateFilters("sort", val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ListProductsSort.popular}>Most Popular</SelectItem>
                <SelectItem value={ListProductsSort.newest}>Newest Arrivals</SelectItem>
                <SelectItem value={ListProductsSort.price_asc}>Price: Low to High</SelectItem>
                <SelectItem value={ListProductsSort.price_desc}>Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => updateFilters("category", "")}
                  className={`text-sm w-full text-left px-2 py-1.5 rounded-md transition-colors hover:bg-muted ${!categoryParam ? 'font-semibold bg-muted text-primary' : 'text-muted-foreground'}`}
                >
                  All Categories
                </button>
              </li>
              {categories?.map(c => (
                <li key={c.id}>
                  <button 
                    onClick={() => updateFilters("category", c.slug)}
                    className={`text-sm w-full text-left px-2 py-1.5 rounded-md transition-colors hover:bg-muted ${categoryParam === c.slug ? 'font-semibold bg-muted text-primary' : 'text-muted-foreground'}`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" /> Clear Filters
            </Button>
          )}
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {qParam && (
                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                  Search: {qParam}
                  <button onClick={() => updateFilters("search", "")} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {categoryParam && (
                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                  Category: {categories?.find(c => c.slug === categoryParam)?.name || categoryParam}
                  <button onClick={() => updateFilters("category", "")} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/5] rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
              <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
              <p className="text-muted-foreground">We couldn't load the products. Please try again.</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : productsPage?.products.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
              <Button className="mt-4" variant="outline" onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {productsPage?.products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
