#!/bin/bash

# Название выходного архива
ARCHIVE_NAME="mancala-clickala-$(date +%Y%m%d-%H%M%S).tar.gz"

# Директории и файлы для исключения
EXCLUDE_PATTERNS=(
    "bin"
    "obj"
    ".vs"
    ".idea"
    ".vscode"
    ".git"
    "node_modules"
    "packages"
    "TestResults"
    "*.user"
    "*.suo"
    ".DS_Store"
    "*.log"
    ".dockerignore"
)

# Формируем параметры exclude для tar
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$pattern"
done

# Создаем архив
echo "Создаю архив: $ARCHIVE_NAME"
tar -czf "$ARCHIVE_NAME" $EXCLUDE_ARGS \
    --exclude-vcs \
    -C .. \
    "$(basename "$PWD")"

# Проверяем результат
if [ $? -eq 0 ]; then
    echo "✅ Архив успешно создан: $ARCHIVE_NAME"
    echo "📦 Размер: $(du -h "$ARCHIVE_NAME" | cut -f1)"
    echo ""
    echo "Содержимое архива:"
    tar -tzf "$ARCHIVE_NAME" | head -20
    echo "..."
else
    echo "❌ Ошибка при создании архива"
    exit 1
fi