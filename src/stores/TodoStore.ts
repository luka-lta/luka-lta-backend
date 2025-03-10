import {TodoTypeSchema} from "@/shemas/TodoSchema.ts";
import {create} from "zustand";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";

const endpoint = import.meta.env.VITE_API_URL;

interface TodoStore {
    todos: TodoTypeSchema[];
    isLoading: boolean;
    error: string | null;
    fetchTodos: () => Promise<void>;
    updateTodo: (id: number, updatedData: Partial<TodoTypeSchema>) => Promise<void>;
    deleteTodo: (id: number) => Promise<void>;
    addTodo: (newTodo: Partial<TodoTypeSchema>) => Promise<void>;
    triggerFetch: () => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
    todos: [],
    isLoading: false,
    error: null,

    fetchTodos: async () => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + '/todo/', {
                headers: {
                    Authorization: `${jwt}`,
                },
            });
            if (!response.ok) throw new Error('Failed to load todos');
            const data = await response.json();
            const todos: TodoTypeSchema[] = data.todos;
            set({ todos, isLoading: false });
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    updateTodo: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + `/todo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${jwt}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Failed to update todo');
            const updatedTodo: TodoTypeSchema = await response.json();

            set((state) => ({
                todos: state.todos.map((todo) =>
                    todo.id === id ? {...todo, ...updatedTodo} : todo
                ),
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    deleteTodo: async (id) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + `/todo/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `${jwt}`,
                },
            });
            if (!response.ok) throw new Error('Failed to delete todo');
            set((state) => ({
                todos: state.todos.filter((todo) => todo.id !== id),
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    addTodo: async (newTodo) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + '/todo/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${jwt}`,
                },
                body: JSON.stringify(newTodo),
            });
            if (!response.ok) throw new Error('Failed to add todo');
            const data  = await response.json();
            const addedTodo: TodoTypeSchema = data.todo;
            set((state) => ({
                todos: [...state.todos, addedTodo],
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    triggerFetch: () => {
        set({ isLoading: true, error: null });
    },

}));