"use client";

import { useState, useEffect } from "react";
import { format, getQuarter, getYear } from "date-fns";
import Image from "next/image";
import { Search, Plus, Trash2, BookOpen, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Card, SectionTitle, PageHeader, EmptyState, StatusBadge } from "@/components/ui/index";
import type { Book, OpenLibraryResult } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  reading: "Currently Reading",
  read: "Read",
  want_to_read: "Want to Read",
};

const STATUS_COLORS: Record<string, string> = {
  reading: "bg-sand-100 text-sand-700",
  read: "bg-sage-100 text-sage-700",
  want_to_read: "bg-stone-100 text-stone-500",
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<OpenLibraryResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"reading" | "read" | "want_to_read">("reading");

  useEffect(() => {
    fetch("/api/books").then((r) => r.json()).then(setBooks);
  }, []);

  async function searchBooks() {
    if (!search.trim()) return;
    setSearching(true);
    const res = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(search)}&limit=6&fields=key,title,author_name,cover_i,first_publish_year`
    );
    const data = await res.json();
    setSearchResults(data.docs ?? []);
    setSearching(false);
  }

  async function addBook(result: OpenLibraryResult, status: Book["status"] = "want_to_read") {
    const coverUrl = result.cover_i
      ? `https://covers.openlibrary.org/b/id/${result.cover_i}-M.jpg`
      : null;

    const now = new Date();
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        openLibraryKey: result.key,
        title: result.title,
        author: result.author_name?.[0] ?? null,
        coverUrl,
        status,
        quarter: status === "read" ? getQuarter(now) : null,
        year: status === "read" ? getYear(now) : null,
      }),
    });
    const book = await res.json();
    setBooks((prev) => [...prev, book]);
    setSearchResults([]);
    setSearch("");
    toast.success(`Added "${result.title}"`);
  }

  async function updateStatus(book: Book, status: Book["status"]) {
    const now = new Date();
    const updates: Partial<Book> = { status };
    if (status === "reading") updates.startedAt = format(now, "yyyy-MM-dd");
    if (status === "read") {
      updates.finishedAt = format(now, "yyyy-MM-dd");
      updates.quarter = getQuarter(now);
      updates.year = getYear(now);
    }

    const res = await fetch("/api/books", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: book.id, ...updates }),
    });
    const updated = await res.json();
    setBooks((prev) => prev.map((b) => (b.id === book.id ? updated : b)));
    toast.success(`Moved to ${STATUS_LABELS[status]}`);
  }

  async function deleteBook(id: number) {
    await fetch(`/api/books?id=${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  const filteredBooks = books.filter((b) => b.status === activeTab);
  const readByQuarter = books
    .filter((b) => b.status === "read" && b.quarter && b.year)
    .reduce<Record<string, Book[]>>((acc, b) => {
      const key = `Q${b.quarter} ${b.year}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(b);
      return acc;
    }, {});

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader title="Books" subtitle="Track your reading journey" />

      {/* Search */}
      <Card className="mb-5">
        <SectionTitle>Search Open Library</SectionTitle>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            className="input-base flex-1"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchBooks()}
          />
          <button onClick={searchBooks} disabled={searching} className="btn-primary flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            {searching ? "Searching…" : "Search"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {searchResults.map((result) => (
              <div key={result.key} className="flex gap-3 p-3 bg-white/60 rounded-xl border border-stone-100 group">
                <div className="w-10 h-14 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                  {result.cover_i ? (
                    <Image
                      src={`https://covers.openlibrary.org/b/id/${result.cover_i}-S.jpg`}
                      alt={result.title}
                      width={40}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{result.title}</p>
                  <p className="text-xs text-stone-400 truncate">{result.author_name?.[0] ?? "Unknown"}</p>
                  {result.first_publish_year && (
                    <p className="text-[10px] text-stone-300">{result.first_publish_year}</p>
                  )}
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => addBook(result, "reading")} className="text-[10px] px-1.5 py-0.5 bg-sand-100 text-sand-700 rounded hover:bg-sand-200 transition-colors">
                      Reading
                    </button>
                    <button onClick={() => addBook(result, "want_to_read")} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded hover:bg-stone-200 transition-colors">
                      Want to Read
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-stone-100 rounded-xl p-1 w-fit">
        {(["reading", "want_to_read", "read"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm transition-all",
              activeTab === status
                ? "bg-white text-stone-700 shadow-sm font-medium"
                : "text-stone-500 hover:text-stone-700"
            )}
          >
            {STATUS_LABELS[status]}
            <span className="ml-1.5 text-xs text-stone-400">
              ({books.filter((b) => b.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Book list */}
      {activeTab === "read" ? (
        // Group by quarter
        <div className="space-y-5">
          {Object.entries(readByQuarter)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([quarter, qBooks]) => (
              <div key={quarter}>
                <SectionTitle>{quarter} — {qBooks.length} book{qBooks.length !== 1 ? "s" : ""}</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {qBooks.map((book) => (
                    <BookCard key={book.id} book={book} onUpdateStatus={updateStatus} onDelete={deleteBook} />
                  ))}
                </div>
              </div>
            ))}
          {filteredBooks.length === 0 && <EmptyState icon="📚" message="No books marked as read yet" />}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredBooks.length === 0 ? (
            <div className="col-span-2">
              <EmptyState icon="📖" message={`No books in "${STATUS_LABELS[activeTab]}" yet`} />
            </div>
          ) : (
            filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onUpdateStatus={updateStatus} onDelete={deleteBook} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function BookCard({
  book,
  onUpdateStatus,
  onDelete,
}: {
  book: Book;
  onUpdateStatus: (book: Book, status: Book["status"]) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="flex gap-3 group">
      <div className="w-12 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            width={48}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <BookOpen className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 leading-snug">{book.title}</p>
        <p className="text-xs text-stone-400 mb-2">{book.author ?? "Unknown author"}</p>

        <div className="flex flex-wrap gap-1">
          {book.status !== "reading" && (
            <button
              onClick={() => onUpdateStatus(book, "reading")}
              className="text-[10px] px-1.5 py-0.5 bg-sand-50 text-sand-600 rounded hover:bg-sand-100 transition-colors"
            >
              Reading
            </button>
          )}
          {book.status !== "read" && (
            <button
              onClick={() => onUpdateStatus(book, "read")}
              className="text-[10px] px-1.5 py-0.5 bg-sage-50 text-sage-600 rounded hover:bg-sage-100 transition-colors flex items-center gap-0.5"
            >
              <Check className="w-2.5 h-2.5" /> Done
            </button>
          )}
          {book.status !== "want_to_read" && (
            <button
              onClick={() => onUpdateStatus(book, "want_to_read")}
              className="text-[10px] px-1.5 py-0.5 bg-stone-50 text-stone-500 rounded hover:bg-stone-100 transition-colors"
            >
              Queue
            </button>
          )}
          <button
            onClick={() => onDelete(book.id)}
            className="text-[10px] px-1.5 py-0.5 text-clay-400 rounded hover:bg-clay-50 transition-colors ml-auto"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
