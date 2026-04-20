"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerProductos, Producto } from "@/lib/productos-db";
import { Loading3DIcon } from "@/components/Loading3DIcon";
import { useUser } from "@/context/UserContext";

export default function AdminPage() {
	const router = useRouter();
	const { isAdmin, loading: authLoading } = useUser();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [stats, setStats] = useState<{
		totalProductos: number;
		productosSinStock: Producto[];
	}>({
		totalProductos: 0,
		productosSinStock: [],
	});

	useEffect(() => {
		async function checkAccessAndFetchStats() {
			// Esperar a que termine la carga de auth
			if (authLoading) return;

			setLoading(true);
			setError("");
			try {
				if (!isAdmin) {
					setError("No tienes permisos de administrador");
					setLoading(false);
					return;
				}

				// Si es admin, cargar datos
				const productosRaw = await obtenerProductos({ incluirSinStock: true });
				const productos = productosRaw as Producto[];

				const productosSinStock = productos.filter((p) => Number(p.stock) === 0);

				setStats({ 
					totalProductos: productos.length, 
					productosSinStock 
				});
			} catch (e) {
				console.error("Error:", e);
				setError("Error al cargar datos. Intenta de nuevo.");
			} finally {
				setLoading(false);
			}
		}
		checkAccessAndFetchStats();
	}, [isAdmin, authLoading]);

	return (
		<div className="w-full">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 mb-8">
				<h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
				<p className="text-purple-100">Bienvenido al panel de administración de Jesus Web</p>
			</div>

			<div className="p-8">
				{loading || authLoading ? (
					<div className="flex flex-col items-center justify-center py-20">
						<Loading3DIcon />
						<p className="mt-4 text-slate-500 dark:text-slate-400">Cargando datos...</p>
					</div>
				) : !isAdmin || error ? (
					<div className="max-w-md mx-auto">
						<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
							<div className="text-5xl mb-4">🔐</div>
							<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
								Acceso Denegado
							</h2>
							<p className="text-slate-600 dark:text-slate-400 mb-6">
								{error === "No autenticado" 
									? "Debes iniciar sesión como administrador para acceder a esta sección."
									: "No tienes permisos de administrador para acceder a esta sección."}
							</p>
							<a
								href="/admin-login"
								className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md shadow-purple-500/20"
							>
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
								</svg>
								Ir a Login de Admin
							</a>
							<p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
								¿Necesitas ayuda? Contacta al propietario del sitio.
							</p>
						</div>
					</div>
				) : error ? (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm font-medium max-w-md mx-auto">
						{error}
					</div>
				) : (
					<div className="flex flex-col gap-8">

						{/* Stats Cards Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{/* Total Productos */}
							<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-start justify-between mb-4">
									<div className="text-3xl">🛍️</div>
									<span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
										Activos
									</span>
								</div>
								<p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Productos</p>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProductos}</p>
							</div>

							{/* Sin Stock */}
							<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-start justify-between mb-4">
									<div className="text-3xl">📦</div>
									{stats.productosSinStock.length > 0 && (
										<span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
											Alerta
										</span>
									)}
								</div>
								<p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Sin Stock</p>
								<p className={`text-2xl font-bold ${stats.productosSinStock.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
									{stats.productosSinStock.length}
								</p>
							</div>

							{/* Placeholder Cards */}
							<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-start justify-between mb-4">
									<div className="text-3xl">📝</div>
									<span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
										Pronto
									</span>
								</div>
								<p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Blogs</p>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">—</p>
							</div>

							<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-start justify-between mb-4">
									<div className="text-3xl">📊</div>
									<span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
										Pronto
									</span>
								</div>
								<p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Reportes</p>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">—</p>
							</div>
						</div>

						{/* Sin Stock Warning */}
						{stats.productosSinStock.length > 0 && (
							<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
								<p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 uppercase tracking-wide">
									⚠️ Productos Sin Stock
								</p>
								<div className="flex flex-wrap gap-2">
									{stats.productosSinStock.slice(0, 10).map((p) => (
										<span
											key={p.id}
											className="text-xs px-3 py-1.5 rounded-full bg-red-200/70 dark:bg-red-800/60 text-red-800 dark:text-red-200 font-medium"
										>
											{p.nombre || p.id}
										</span>
									))}
									{stats.productosSinStock.length > 10 && (
										<span className="text-xs text-red-600 dark:text-red-400 self-center font-medium">
											+{stats.productosSinStock.length - 10} más
										</span>
									)}
								</div>
							</div>
						)}

						{/* Quick Access */}
						<div>
							<h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-4">
								Accesos Rápidos
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{[
									{ label: "Productos", desc: "Gestionar inventario", href: "/admin/productos", icon: "🛍️" },
									{ label: "Categorías", desc: "Organizar categorías", href: "/admin/categorias", icon: "📂" },
									{ label: "Blogs", desc: "Crear y editar contenido", href: "/admin/blogs", icon: "📝" },
									{ label: "Usuarios", desc: "Gestionar usuarios", href: "/admin/usuarios", icon: "👥" },
									{ label: "Órdenes", desc: "Ver órdenes de clientes", href: "/admin/ordenes", icon: "📦" },
									{ label: "Configuración", desc: "Ajustes del sistema", href: "/admin/configuracion", icon: "⚙️" },
								].map((item) => (
									<a
										key={item.href}
										href={item.href}
										className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-left hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all group"
									>
										<div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
										<p className="font-semibold text-slate-900 dark:text-white text-sm">{item.label}</p>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
									</a>
								))}
							</div>
						</div>

						{/* Status Section */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
								<p className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">ℹ️ Estado del Sistema</p>
								<p className="text-slate-900 dark:text-white font-semibold">Funcionando correctamente</p>
							</div>
							<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
								<p className="text-sm text-green-600 dark:text-green-400 mb-2 font-semibold">✓ Seguridad</p>
								<p className="text-slate-900 dark:text-white font-semibold">Verificado</p>
							</div>
							<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5">
								<p className="text-sm text-purple-600 dark:text-purple-400 mb-2 font-semibold">🔐 Acceso Admin</p>
								<p className="text-slate-900 dark:text-white font-semibold">Verificado</p>
							</div>
						</div>

					</div>
				)}
			</div>
		</div>
	);
}