import React, { useState } from 'react';
import axios from 'axios';
import { Button, Card, Container, Form, Alert, Spinner, Table } from 'react-bootstrap';
import { API_BASE_URL } from '../../config';

interface ImportError {
  row: number;
  message: string;
}

interface PreviewData {
  headers: string[];
  data: Record<string, string>[];
  errors: ImportError[];
  valid_count: number;
  invalid_count: number;
}

const ImportCsv: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [importInProgress, setImportInProgress] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{success: number, errors: number} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setPreviewData(null);
      setErrorMessage('');
      setSuccessMessage('');
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setErrorMessage('Por favor, selecciona un archivo CSV');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<any>(
        `${API_BASE_URL}/api/v1/imports/preview`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.type === 'error') {
        setErrorMessage(response.data.message || 'Error al previsualizar el archivo');
        setPreviewData(null);
      } else {
        setPreviewData(response.data.data);
        setSuccessMessage('Previsualización completada. Revisa los datos antes de importar.');
      }
    } catch (error: any) {
      console.error('Error previewing CSV:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Error al previsualizar el archivo. Verifica el formato del CSV.'
      );
      setPreviewData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !previewData) {
      setErrorMessage('Por favor, previsualiza el archivo antes de importar');
      return;
    }

    setImportInProgress(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<any>(
        `${API_BASE_URL}/api/v1/imports/import/csv`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.type === 'error') {
        setErrorMessage(response.data.message || 'Error al importar el archivo');
      } else {
        setImportResult({
          success: response.data.data.success_count,
          errors: response.data.data.error_count
        });
        setSuccessMessage(
          `Importación completada: ${response.data.data.success_count} registros importados, ` +
          `${response.data.data.error_count} errores.`
        );
      }
    } catch (error: any) {
      console.error('Error importing CSV:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Error al importar el archivo. Intenta de nuevo más tarde.'
      );
    } finally {
      setImportInProgress(false);
    }
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h3>Importación de Datos CSV</h3>
        </Card.Header>
        <Card.Body>
          {errorMessage && (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}
          
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label><strong>Seleccionar archivo CSV</strong></Form.Label>
            <Form.Control 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              disabled={isLoading || importInProgress}
            />
            <Form.Text className="text-muted">
              El archivo debe estar en formato CSV con las columnas correctas.
            </Form.Text>
          </Form.Group>
          
          <div className="d-flex gap-2 mb-4">
            <Button 
              variant="secondary" 
              onClick={handlePreview} 
              disabled={!file || isLoading || importInProgress}
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Procesando...</span>
                </>
              ) : "Previsualizar"}
            </Button>
            
            <Button 
              variant="primary" 
              onClick={handleImport} 
              disabled={!previewData || importInProgress || isLoading}
            >
              {importInProgress ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Importando...</span>
                </>
              ) : "Importar Datos"}
            </Button>
          </div>
          
          {importResult && (
            <Alert variant={importResult.errors > 0 ? "warning" : "success"}>
              <h5>Resultado de la importación:</h5>
              <p>
                <strong>Registros importados:</strong> {importResult.success}<br />
                <strong>Errores encontrados:</strong> {importResult.errors}
              </p>
              {importResult.errors > 0 && (
                <p>Algunos registros no pudieron ser importados. Revisa el archivo y vuelve a intentar.</p>
              )}
            </Alert>
          )}
          
          {previewData && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Previsualización de datos</h5>
                <div>
                  <span className="badge bg-success me-2">Válidos: {previewData.valid_count}</span>
                  <span className="badge bg-danger">Inválidos: {previewData.invalid_count}</span>
                </div>
              </div>
              
              {previewData.errors.length > 0 && (
                <Alert variant="warning" className="mb-3">
                  <h6>Errores detectados:</h6>
                  <ul className="mb-0">
                    {previewData.errors.map((error, index) => (
                      <li key={index}>
                        Fila {error.row}: {error.message}
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}
              
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead className="bg-light">
                    <tr>
                      {previewData.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.data.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {previewData.headers.map((header, colIndex) => (
                          <td key={colIndex}>
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {previewData.data.length > 10 && (
                  <div className="text-center text-muted">
                    Mostrando 10 de {previewData.data.length} registros
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ImportCsv;