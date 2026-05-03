import { useEffect, useState } from "react";
import {
    RotateCcw,
    Trash2,
    Loader2,
    Database,
} from "lucide-react";

import { readStoredAuth } from "../lib/authStorage";
import {
    getRestoreItems,
    restoreItem,
    hardDeleteItem,
} from "../lib/api";

export default function RestoreTable({
    title,
    endpoint,
    columns = [],
}) {
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] =
        useState(null);

    const token = readStoredAuth()?.access;

    const loadData = async (pageNumber = 1) => {
        try {
            setLoading(true);

            const res = await getRestoreItems(
                endpoint,
                token,
                pageNumber
            );

            const results = res?.results || [];

            setItems(results);
            setCount(res?.count || results.length);
            setPage(pageNumber);
        } catch (error) {
            console.error(error);
            alert(
                error?.message || "Failed to load deleted data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(1);
    }, [endpoint]);

    const handleRestore = async (id) => {
        if (!window.confirm("Restore this item?")) return;

        try {
            setActionLoading(`restore-${id}`);

            await restoreItem(endpoint, id, token);

            await loadData(page);
        } catch (error) {
            console.error(error);
            alert(error?.message || "Restore failed");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
       
        if (
            !window.confirm(
                "Permanently delete this item?"
            )
        )
            return;

        try {
            console.log(id)
            setActionLoading(`delete-${id}`);

            await hardDeleteItem(endpoint, id, token);

            await loadData(page);
        } catch (error) {
            console.error(error);
            alert(error?.message || "Delete failed");
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(count / 10);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-500">
                        Total deleted items: {count}
                    </p>
                </div>

                <button
                    onClick={() => loadData(page)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="h-72 flex flex-col items-center justify-center gap-3 text-gray-500">
                    <Loader2
                        size={32}
                        className="animate-spin"
                    />
                    <p>Loading...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center gap-3 text-gray-500">
                    <Database size={42} />
                    <p>No deleted data found</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className="px-5 py-4 text-left"
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="px-5 py-4 text-left">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className="px-5 py-4"
                                            >
                                                {String(
                                                    item[col.key] ?? "-"
                                                )}
                                            </td>
                                        ))}

                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleRestore(
                                                            item.id
                                                        )
                                                    }
                                                    disabled={!!actionLoading}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60"
                                                >
                                                    {actionLoading ===
                                                        `restore-${item.id}` ? (
                                                        <Loader2
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <RotateCcw
                                                            size={15}
                                                        />
                                                    )}
                                                    Restore
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            item.id
                                                        )
                                                    }
                                                    disabled={!!actionLoading}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
                                                >
                                                    {actionLoading ===
                                                        `delete-${item.id}` ? (
                                                        <Loader2
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={15} />
                                                    )}
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-3">
                            <button
                                disabled={page === 1}
                                onClick={() =>
                                    loadData(page - 1)
                                }
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>

                            <span className="px-4 py-2">
                                {page} / {totalPages}
                            </span>

                            <button
                                disabled={
                                    page === totalPages
                                }
                                onClick={() =>
                                    loadData(page + 1)
                                }
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}