/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import cn from 'classnames';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';

import { getTodos } from './api';
import type { Todo } from './types/Todo';

type Filter = 'all' | 'completed' | 'active';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const handleSelectTodo = (id: number | null) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleChangeFilter = (next: Filter) => {
    setFilter(next);
    setSelectedId(null);
  };

  const handleLoadTodos = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getTodos();
      setTodos(data);
    } catch (e) {
      setError((e as Error).message || 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void handleLoadTodos();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTodos = todos.filter(t => {
    const matchesStatus =
      filter === 'all' ? true : filter === 'completed' ? t.completed : !t.completed;
    const matchesQuery = t.title.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesQuery;
  });

  const selectedTodo =
    selectedId == null ? null : filteredTodos.find(t => t.id === selectedId) ?? null;

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <div className="is-flex is-justify-content-space-between is-align-items-center">
              <h1 className="title">Todos:</h1>

              <span className="tag is-link is-light" data-cy="todosCount">
                {filteredTodos.length}
              </span>
            </div>

            <div className="block">
              <TodoFilter
                value={filter}
                onChange={handleChangeFilter}
                query={query}
                onQueryChange={setQuery}
                onClearQuery={() => setQuery('')}
              />
            </div>

            <div className="block">
              {error && (
                <p className={cn('notification', 'is-danger')} data-cy="error">
                  {error}
                </p>
              )}

              {loading && <Loader />}

              {!loading && !error && filteredTodos.length > 0 && (
                <TodoList
                  todos={filteredTodos}
                  selectedId={selectedId}
                  onSelect={handleSelectTodo}
                />
              )}

              {!loading && !error && filteredTodos.length === 0 && (
                <p className="has-text-grey" data-cy="emptyState">
                  No todos found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedTodo && (
        <TodoModal
          todo={selectedTodo}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
};
