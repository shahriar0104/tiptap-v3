"use client"

import * as React from "react"
import type {NodeViewProps} from "@tiptap/react"
import {NodeViewWrapper} from "@tiptap/react"
import {Button} from "@/components/tiptap-ui-primitive/button"
import {CloseIcon} from "@/components/tiptap-icons/close-icon"
import "@/components/tiptap-node/chart-upload-node/chart-upload-node.scss"
import dynamic from "next/dynamic"

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export interface ChartFileItem {
  /**
   * Unique identifier for the file item
   */
  id: string
  /**
   * The actual File object being processed
   */
  file: File
  /**
   * Current processing progress as a percentage (0-100)
   */
  progress: number
  /**
   * Current status of the file processing
   * @default "processing"
   */
  status: "processing" | "success" | "error"

  /**
   * Chart configuration after successful processing
   * @optional
   */
  config?: any
  /**
   * Controller that can be used to abort the processing
   * @optional
   */
  abortController?: AbortController
}

export interface ChartUploadOptions {
  /**
   * Maximum allowed file size in bytes
   */
  maxSize: number
  /**
   * Maximum number of files that can be processed
   */
  limit: number
  /**
   * String specifying acceptable file types
   * @example ".csv,.xlsx,.xls"
   */
  accept: string
  /**
   * Function that handles the chart data processing
   * @param {File} file - The file to be processed
   * @param {Function} onProgress - Callback function to report processing progress
   * @param {AbortSignal} signal - Signal that can be used to abort the processing
   * @returns {Promise<any>} Promise resolving to the chart configuration
   */
  upload: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    signal: AbortSignal
  ) => Promise<any>
  /**
   * Callback triggered when a file is processed successfully
   * @param {any} config - Chart configuration
   * @optional
   */
  onSuccess?: (config: any) => void
  /**
   * Callback triggered when an error occurs during processing
   * @param {Error} error - The error that occurred
   * @optional
   */
  onError?: (error: Error) => void
}

/**
 * Custom hook for managing chart file processing with progress tracking and cancellation
 */
function useChartFileUpload(options: ChartUploadOptions) {
  const [fileItems, setFileItems] = React.useState<ChartFileItem[]>([])

  const processFile = async (file: File): Promise<any | null> => {
    if (file.size > options.maxSize && options.maxSize > 0) {
      const error = new Error(
        `File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`
      )
      options.onError?.(error)
      return null
    }

    const abortController = new AbortController()
    const fileId = crypto.randomUUID()

    const newFileItem: ChartFileItem = {
      id: fileId,
      file,
      progress: 0,
      status: "processing",
      abortController,
    }

    setFileItems((prev) => [...prev, newFileItem])

    try {
      if (!options.upload) {
        throw new Error("Upload function is not defined")
      }

      const config = await options.upload(
        file,
        (event: { progress: number }) => {
          setFileItems((prev) =>
            prev.map((item) =>
              item.id === fileId ? { ...item, progress: event.progress } : item
            )
          )
        },
        abortController.signal
      )

      if (!config) throw new Error("Processing failed: No configuration returned")

      if (!abortController.signal.aborted) {
        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "success", config, progress: 100 }
              : item
          )
        )
        options.onSuccess?.(config)
        return config
      }

      return null
    } catch (error) {
      if (!abortController.signal.aborted) {
        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "error", progress: 0 }
              : item
          )
        )
        options.onError?.(
          error instanceof Error ? error : new Error("Processing failed")
        )
      }
      return null
    }
  }

  const processFiles = async (files: File[]): Promise<any[]> => {
    if (!files || files.length === 0) {
      options.onError?.(new Error("No files to process"))
      return []
    }

    if (options.limit && files.length > options.limit) {
      options.onError?.(
        new Error(
          `Maximum ${options.limit} file${options.limit === 1 ? "" : "s"} allowed`
        )
      )
      return []
    }

    // Process all files concurrently
    const processPromises = files.map((file) => processFile(file))
    const results = await Promise.all(processPromises)

    // Filter out null results (failed processing)
    return results.filter((config): config is any => config !== null)
  }

  const removeFileItem = (fileId: string) => {
    setFileItems((prev) => {
      const fileToRemove = prev.find((item) => item.id === fileId)
      if (fileToRemove?.abortController) {
        fileToRemove.abortController.abort()
      }
      return prev.filter((item) => item.id !== fileId)
    })
  }

  const clearAllFiles = () => {
    fileItems.forEach((item) => {
      if (item.abortController) {
        item.abortController.abort()
      }
    })
    setFileItems([])
  }

  return {
    fileItems,
    processFiles,
    removeFileItem,
    clearAllFiles,
  }
}

const ChartIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="tiptap-chart-upload-icon"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 3v18h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M18 17V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M13 17V5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M8 17v-3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const FileIcon: React.FC = () => (
  <svg
    width="43"
    height="57"
    viewBox="0 0 43 57"
    fill="currentColor"
    className="tiptap-chart-upload-dropzone-rect-primary"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.75 10.75C0.75 5.64137 4.89137 1.5 10 1.5H32.3431C33.2051 1.5 34.0317 1.84241 34.6412 2.4519L40.2981 8.10876C40.9076 8.71825 41.25 9.5449 41.25 10.4069V46.75C41.25 51.8586 37.1086 56 32 56H10C4.89137 56 0.75 51.8586 0.75 46.75V10.75Z"
      fill="currentColor"
      fillOpacity="0.11"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const FileCornerIcon: React.FC = () => (
  <svg
    width="10"
    height="10"
    className="tiptap-chart-upload-dropzone-rect-secondary"
    viewBox="0 0 10 10"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0.75H0.343146C1.40401 0.75 2.42143 1.17143 3.17157 1.92157L8.82843 7.57843C9.57857 8.32857 10 9.34599 10 10.4069V10.75H4C1.79086 10.75 0 8.95914 0 6.75V0.75Z"
      fill="currentColor"
    />
  </svg>
)

interface ChartUploadDragAreaProps {
  /**
   * Callback function triggered when files are dropped or selected
   * @param {File[]} files - Array of File objects that were dropped or selected
   */
  onFile: (files: File[]) => void
  /**
   * Optional child elements to render inside the drag area
   * @optional
   * @default undefined
   */
  children?: React.ReactNode
}

/**
 * A component that creates a drag-and-drop area for chart uploads
 */
const ChartUploadDragArea: React.FC<ChartUploadDragAreaProps> = ({
  onFile,
  children,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [isDragActive, setIsDragActive] = React.useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false)
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFile(files)
    }
  }

  return (
    <div
      className={`tiptap-chart-upload-drag-area ${isDragActive ? "drag-active" : ""} ${isDragOver ? "drag-over" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  )
}

interface ChartUploadPreviewProps {
  /**
   * The file item to preview
   */
  fileItem: ChartFileItem
  /**
   * Callback to remove this file from processing queue
   */
  onRemove: () => void
}

/**
 * Component that displays a preview of a processing file with progress
 */
const ChartUploadPreview: React.FC<ChartUploadPreviewProps> = ({
  fileItem,
  onRemove,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="tiptap-chart-upload-preview">
      {fileItem.status === "processing" && (
        <div
          className="tiptap-chart-upload-progress"
          style={{ width: `${fileItem.progress}%` }}
        />
      )}

      <div className="tiptap-chart-upload-preview-content">
        {fileItem.status === "processing" ? (
          // Show file info during processing
          <>
            <div className="tiptap-chart-upload-file-info">
              <div className="tiptap-chart-upload-file-icon">
                <ChartIcon />
              </div>
              <div className="tiptap-chart-upload-details">
                <span className="tiptap-chart-upload-text">
                  {fileItem.file.name}
                </span>
                <span className="tiptap-chart-upload-subtext">
                  {formatFileSize(fileItem.file.size)}
                </span>
              </div>
            </div>
            <div className="tiptap-chart-upload-actions">
              <span className="tiptap-chart-upload-progress-text">
                {fileItem.progress}%
              </span>
              <Button
                type="button"
                data-style="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
              >
                <CloseIcon className="tiptap-button-icon" />
              </Button>
            </div>
          </>
        ) : fileItem.status === "success" && fileItem.config ? (
          // Show chart preview when processing is complete
          <>
            <div className="tiptap-chart-upload-chart-preview">
              <div className="tiptap-chart-upload-chart-container">
                <ApexChart
                  key={fileItem.id}
                  options={fileItem.config.options}
                  series={fileItem.config.series}
                  type={fileItem.config.type}
                  height={200}
                />
              </div>
              <div className="tiptap-chart-upload-file-info">
                <div className="tiptap-chart-upload-file-icon">
                  <ChartIcon />
                </div>
                <div className="tiptap-chart-upload-details">
                  <span className="tiptap-chart-upload-text">
                    {fileItem.file.name}
                  </span>
                  <span className="tiptap-chart-upload-subtext">
                    Chart ready
                  </span>
                </div>
              </div>
            </div>
            <div className="tiptap-chart-upload-actions">
              <Button
                type="button"
                data-style="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
              >
                <CloseIcon className="tiptap-button-icon" />
              </Button>
            </div>
          </>
        ) : (
          // Show error state
          <>
            <div className="tiptap-chart-upload-file-info">
              <div className="tiptap-chart-upload-file-icon">
                <ChartIcon />
              </div>
              <div className="tiptap-chart-upload-details">
                <span className="tiptap-chart-upload-text">
                  {fileItem.file.name}
                </span>
                <span className="tiptap-chart-upload-subtext">
                  Processing failed
                </span>
              </div>
            </div>
            <div className="tiptap-chart-upload-actions">
              <Button
                type="button"
                data-style="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
              >
                <CloseIcon className="tiptap-button-icon" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const DropZoneContent: React.FC<{ maxSize: number; limit: number }> = ({
  maxSize,
  limit,
}) => (
  <>
    <div className="tiptap-chart-upload-dropzone">
      <FileIcon />
      <FileCornerIcon />
      <div className="tiptap-chart-upload-icon-container">
        <ChartIcon />
      </div>
    </div>

    <div className="tiptap-chart-upload-content">
      <span className="tiptap-chart-upload-text">
        <em>Click to upload</em> or drag and drop
      </span>
      <span className="tiptap-chart-upload-subtext">
        CSV or Excel files to create charts
      </span>
      <span className="tiptap-chart-upload-subtext">
        Maximum {limit} file{limit === 1 ? "" : "s"}, {maxSize / 1024 / 1024}MB
        each.
      </span>
    </div>
  </>
)

export const ChartUploadNode: React.FC<NodeViewProps> = (props) => {
  const { accept, limit, maxSize, config } = props.node.attrs
  const inputRef = React.useRef<HTMLInputElement>(null)
  const extension = props.extension

  console.log(props);

  const uploadOptions: ChartUploadOptions = {
    maxSize,
    limit,
    accept,
    upload: extension.options.upload,
    onSuccess: extension.options.onSuccess,
    onError: extension.options.onError,
  }

  const { fileItems, processFiles, removeFileItem, clearAllFiles } =
    useChartFileUpload(uploadOptions)

  const handleUpload = async (files: File[]) => {
    const configs = await processFiles(files)

    if (configs.length > 0) {
      const config = configs[0] // Take the first config since we only allow 1 file
      
      // Update the current node with the config
      props.updateAttributes({ config })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      extension.options.onError?.(new Error("No file selected"))
      return
    }
    handleUpload(Array.from(files))
  }

  const handleClick = () => {
    if (inputRef.current && fileItems.length === 0) {
      inputRef.current.value = ""
      inputRef.current.click()
    }
  }

  const hasFiles = fileItems.length > 0

  // If we have a config, render the chart
  if (config) {
    return (
      <NodeViewWrapper className="tiptap-chart-upload">
        <div className="tiptap-chart-upload-chart-container">
          <ApexChart
            key={crypto.randomUUID()}
            options={config.options}
            series={config.series}
            type={config.type}
            height={400}
          />
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      className="tiptap-chart-upload"
      tabIndex={0}
      onClick={handleClick}
    >
      {!hasFiles && (
        <ChartUploadDragArea onFile={handleUpload}>
          <DropZoneContent maxSize={maxSize} limit={limit} />
        </ChartUploadDragArea>
      )}

      {hasFiles && (
        <div className="tiptap-chart-upload-previews">
          {fileItems.length > 1 && (
            <div className="tiptap-chart-upload-header">
              <span>Processing {fileItems.length} files</span>
              <Button
                type="button"
                data-style="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAllFiles()
                }}
              >
                Clear All
              </Button>
            </div>
          )}
          {fileItems.map((fileItem) => (
            <ChartUploadPreview
              key={fileItem.id}
              fileItem={fileItem}
              onRemove={() => removeFileItem(fileItem.id)}
            />
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        name="file"
        accept={accept}
        type="file"
        multiple={limit > 1}
        onChange={handleChange}
        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
      />
    </NodeViewWrapper>
  )
}