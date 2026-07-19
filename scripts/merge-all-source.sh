#!/bin/bash
# ============================================================================
# MERGE ALL SOURCE CODE - ROTAS NORDESTINAS
# ============================================================================
# Este script percorre todos os arquivos de código fonte do projeto
# e gera um único arquivo .txt com o conteúdo de todos eles,
# facilitando a análise, documentação e compartilhamento.
#
# Uso:
#   chmod +x merge-all-source.sh
#   ./merge-all-source.sh
#
# O arquivo gerado será: rotas-nordestinas-completo.txt
# ============================================================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_FILE="$PROJECT_ROOT/rotas-nordestinas-completo.txt"

# Limpa o arquivo de saída se existir
> "$OUTPUT_FILE"

echo "========================================"
echo " Rotas Nordestinas - Merge de Código"
echo "========================================"
echo ""
echo "Gerando $OUTPUT_FILE ..."
echo ""

# Função para adicionar arquivo ao output
add_file() {
  local file="$1"
  local relative_path="${file#$PROJECT_ROOT/}"

  # Pula arquivos binários, node_modules, .next, etc.
  if [[ "$file" == *"node_modules"* ]] || \
     [[ "$file" == *".next"* ]] || \
     [[ "$file" == *".vite"* ]] || \
     [[ "$file" == *"pnpm-lock"* ]] || \
     [[ "$file" == *"package-lock"* ]]; then
    return
  fi

  # Só processa arquivos de texto/código
  if [[ "$file" == *.js ]] || \
     [[ "$file" == *.ts ]] || \
     [[ "$file" == *.tsx ]] || \
     [[ "$file" == *.css ]] || \
     [[ "$file" == *.json ]] || \
     [[ "$file" == *.html ]] || \
     [[ "$file" == *.sql ]] || \
     [[ "$file" == *.sh ]] || \
     [[ "$file" == *.yml ]] || \
     [[ "$file" == *.yaml ]] || \
     [[ "$file" == *.env* ]]; then

    echo "  📄 Adicionando: $relative_path"

    {
      echo ""
      echo "========================================================================"
      echo " ARQUIVO: $relative_path"
      echo "========================================================================="
      echo ""
      cat "$file"
      echo ""
      echo ""
    } >> "$OUTPUT_FILE"
  fi
}

# Define os diretórios e arquivos para incluir
# (ordem: primeiro os mais importantes)

# 1. Raiz do projeto (apenas .env.example, nunca arquivos .env reais!)
for file in "$PROJECT_ROOT"/.env.example "$PROJECT_ROOT"/*.{json,ts,tsx,js,sh,yml,yaml,sql}; do
  [ -f "$file" ] && add_file "$file"
done

# 2. Backend
find "$PROJECT_ROOT/backend/src" -type f \( -name "*.js" -o -name "*.json" \) | while read -r file; do
  add_file "$file"
done

# 3. Backend Tests
find "$PROJECT_ROOT/backend/tests" -type f -name "*.js" | while read -r file; do
  add_file "$file"
done

# 4. Frontend (Next.js app)
find "$PROJECT_ROOT/app" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) | while read -r file; do
  add_file "$file"
done

# 5. Frontend (Vite app)
find "$PROJECT_ROOT/frontend/src" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) | while read -r file; do
  add_file "$file"
done

# 6. Components
find "$PROJECT_ROOT/components" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) | while read -r file; do
  add_file "$file"
done

# 7. Context
find "$PROJECT_ROOT/context" -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  add_file "$file"
done

# 8. Lib
find "$PROJECT_ROOT/lib" -type f -name "*.ts" | while read -r file; do
  add_file "$file"
done

# 9. Types
find "$PROJECT_ROOT/types" -type f -name "*.ts" | while read -r file; do
  add_file "$file"
done

# 10. Scripts (incluindo este)
find "$PROJECT_ROOT/scripts" -type f \( -name "*.sql" -o -name "*.sh" \) | while read -r file; do
  add_file "$file"
done

# 11. Config files da raiz
for file in "$PROJECT_ROOT"/{tsconfig.json,next.config.ts,.gitignore}; do
  [ -f "$file" ] && add_file "$file"
done

# 12. Frontend config (Vite)
for file in "$PROJECT_ROOT/frontend"/{tsconfig.json,tsconfig.app.json,tsconfig.node.json,vite.config.ts,index.html}; do
  [ -f "$file" ] && add_file "$file"
done

echo ""
echo "========================================"
echo " ✅ Merge concluído!"
echo "========================================"
echo ""
echo "Arquivo gerado: $OUTPUT_FILE"
FILESIZE=$(wc -c < "$OUTPUT_FILE")
if command -v numfmt &> /dev/null; then
  SIZE_HUMAN=$(numfmt --to=iec <<< "$FILESIZE")
else
  SIZE_HUMAN="${FILESIZE} bytes"
fi
echo "Tamanho: $SIZE_HUMAN ($(wc -l < "$OUTPUT_FILE") linhas)"
echo ""
echo "Você pode encontrar o arquivo em:"
echo "  $OUTPUT_FILE"
