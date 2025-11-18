import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Book, Search } from "lucide-react";
import { glossaryData, GlossaryTerm } from "@/data/glossaryData";

export function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTerms = glossaryData.reduce((acc, category) => {
    const categoryTerms = category.terms.filter(term => {
      const matchesSearch = searchTerm === "" || 
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === null || category.id === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    if (categoryTerms.length > 0) {
      acc.push({
        ...category,
        terms: categoryTerms
      });
    }

    return acc;
  }, [] as typeof glossaryData);

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case "vocabulary": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "cybersecurity-basics": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "cyber-threats": return "bg-red-100 text-red-800 hover:bg-red-200";
      case "cyber-actors": return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          <Book className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Glossaire Global</h1>
          <p className="text-muted-foreground">
            Glossaire de l'exercice de crise cybersécurité
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
        Ce glossaire vous sera utile pour expliciter certains termes propres à la gestion de crise ayant pour origine une attaque cybersécurité.
      </p>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un terme ou une définition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/20"
            onClick={() => setSelectedCategory(null)}
          >
            Toutes les catégories
          </Badge>
          {glossaryData.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                selectedCategory === category.id ? "" : getCategoryColor(category.id)
              }`}
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
            >
              {category.title}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {(searchTerm || selectedCategory) && (
        <div className="text-sm text-muted-foreground">
          {filteredTerms.reduce((acc, cat) => acc + cat.terms.length, 0)} terme(s) trouvé(s)
        </div>
      )}

      {/* Glossary Content */}
      <div className="space-y-8">
        {filteredTerms.map((category) => (
          <div key={category.id}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-primary">{category.title}</h2>
              <Badge variant="secondary" className={getCategoryColor(category.id)}>
                {category.terms.length} terme{category.terms.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {category.terms.map((term) => (
                <Card key={term.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-start justify-between gap-4">
                      <span className="text-lg font-semibold text-foreground">
                        {term.term}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {term.id}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {term.definition}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucun terme trouvé
            </h3>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}