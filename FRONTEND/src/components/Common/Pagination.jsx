// src/components/Common/Pagination.jsx - COMPONENTE UNIFICADO DE PAGINACIÓN
import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  loading = false,
  showPageInfo = true
}) => {
  // No mostrar si solo hay una página o ninguna
  if (totalPages <= 1) {
    return null;
  }

  // Generar páginas a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);
      
      // Calcular rango de páginas alrededor de la actual
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Agregar ellipsis si hay gap al inicio
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Agregar páginas del rango
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Agregar ellipsis si hay gap al final
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Siempre mostrar última página
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !loading) {
      onPageChange(page);
    }
  };

  const pages = getPageNumbers();

  return (
    <div className={`pagination-container ${loading ? 'loading' : ''}`}>
      {showPageInfo && (
        <div className="pagination-info">
          Página {currentPage} de {totalPages}
        </div>
      )}
      
      <div className="pagination">
        {/* Botón Anterior */}
        <button
          className="pagination-btn pagination-prev"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          title="Anterior"
        >
          ◀
        </button>

        {/* Números de página */}
        <div className="pagination-pages">
          {pages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  className={`pagination-btn pagination-number ${
                    page === currentPage ? 'active' : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botón Siguiente */}
        <button
          className="pagination-btn pagination-next"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          title="Siguiente"
        >
          ▶
        </button>
      </div>

      {/* Selector de registros por página */}
      <div className="pagination-per-page">
        <label htmlFor="per-page">Por página:</label>
        <select id="per-page" disabled={loading}>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;
