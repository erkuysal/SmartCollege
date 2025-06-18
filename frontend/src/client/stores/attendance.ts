import { defineStore } from 'pinia'
import { getAttendanceRecords, markAttendance, getSession } from '../api'
import type { AttendanceRecord } from '../api'

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

interface ScanningState {
  isScanning: boolean
  error: string | null
  lastScan: {
    student_number: string
    timestamp: string
    message: string
    status: 'ok' | 'warning' | 'error'
  } | null
  reconnectAttempts: number
  maxReconnectAttempts: number
  abortController: AbortController | null
}

interface ScanEvent {
  status: 'ok' | 'warning' | 'error'
  student_number?: string
  timestamp?: string
  message: string
  session_id?: number
  uid?: string
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    records: [] as AttendanceRecord[],
    error: '',
    isLoading: false,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    scanning: {
      isScanning: false,
      error: null,
      lastScan: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 3,
      abortController: null
    } as ScanningState
  }),

  getters: {
    getRecordsBySession: (state) => {
      return (sessionId: number) => state.records.filter(record => record.session === sessionId)
    },

    getRecordsByStudent: (state) => {
      return (studentId: number) => state.records.filter(record => record.student.id === studentId)
    }
  },

  actions: {
    async fetchRecords(params?: { timestamp_date?: string; session?: number }) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await getAttendanceRecords(params)
        this.records = response.data.results
        this.totalCount = response.data.count
        this.hasNextPage = !!response.data.next
        this.hasPreviousPage = !!response.data.previous
      } catch (e: any) {
        this.error = e.response?.data?.detail || 'Failed to fetch attendance records'
        console.error('Error fetching attendance records:', e)
      } finally {
        this.isLoading = false
      }
    },

    async markAttendance(sessionId: number, studentNumber: string, uid: string) {
      this.isLoading = true
      this.error = ''
      
      // Validate input parameters
      if (!sessionId) {
        this.error = 'Session ID is required'
        return
      }
      if (!studentNumber) {
        this.error = 'Student number is required'
        return
      }
      if (!uid) {
        this.error = 'RFID card UID is required'
        return
      }

      try {
        // Check if session is active
        const sessionResponse = await getSession(sessionId)
        if (!sessionResponse.data.is_active) {
          this.error = 'Session is not active'
          return
        }

        const response = await markAttendance({ 
          session: sessionId,
          user_number: studentNumber,
          uid: uid
        })
        
        // Fetch the latest records after marking attendance
        await this.fetchRecords({ session: sessionId })
        return response.data
      } catch (e: any) {
        this.error = e.response?.data?.detail || 'Failed to mark attendance'
        console.error('Error marking attendance:', e)
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async startContinuousScanning(sessionId: number) {
      if (this.scanning.isScanning) {
        console.warn('Continuous scanning is already active')
        return
      }

      // Reset scanning state
      this.scanning.isScanning = true
      this.scanning.error = null
      this.scanning.lastScan = null
      this.scanning.reconnectAttempts = 0
      this.scanning.abortController = new AbortController()

      try {
        // Validate session state
        const sessionResponse = await getSession(sessionId)
        if (!sessionResponse.data.is_active) {
          this.scanning.error = 'Session is not active'
          this.stopScanning()
          return
        }

        const response = await fetch(`/api/mark-attendance/?continuous=true&session=${sessionId}`, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
          },
          signal: this.scanning.abortController.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('Failed to get response reader')
        }

        // Process the stream
        while (this.scanning.isScanning) {
          try {
            const { done, value } = await reader.read()
            if (done) {
              console.log('Stream complete')
              break
            }

            // Process the stream data
            const data = new TextDecoder().decode(value)
            const events = data.split('\n\n')

            for (const event of events) {
              if (event.startsWith('data: ')) {
                try {
                  const jsonData = JSON.parse(event.slice(6)) as ScanEvent
                  
                  // Handle different event types
                  switch (jsonData.status) {
                    case 'error':
                      this.scanning.error = jsonData.message
                      if (jsonData.message.includes('Session has ended')) {
                        this.stopScanning()
                      }
                      break
                    
                    case 'warning':
                    case 'ok':
                      this.scanning.lastScan = {
                        student_number: jsonData.student_number || '',
                        timestamp: jsonData.timestamp || new Date().toISOString(),
                        message: jsonData.message,
                        status: jsonData.status
                      }
                      
                      if (jsonData.status === 'ok') {
                        // Refresh attendance records with debounce
                        await this.debouncedFetchRecords(sessionId)
                      }
                      break
                  }
                } catch (e) {
                  console.error('Error parsing event data:', e)
                  this.scanning.error = 'Failed to parse scan data'
                }
              }
            }
          } catch (readError: unknown) {
            if (readError instanceof Error && readError.name === 'AbortError') {
              console.log('Scanning was aborted')
              break
            }
            throw readError
          }
        }
      } catch (error: any) {
        this.scanning.error = error.message || 'Connection lost'
        console.error('Scanning error:', error)
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (this.scanning.isScanning && this.scanning.reconnectAttempts < this.scanning.maxReconnectAttempts) {
          this.scanning.reconnectAttempts++
          console.log(`Attempting to reconnect (${this.scanning.reconnectAttempts}/${this.scanning.maxReconnectAttempts})...`)
          
          // Wait before reconnecting
          await new Promise(resolve => setTimeout(resolve, 5000))
          await this.startContinuousScanning(sessionId)
        } else if (this.scanning.reconnectAttempts >= this.scanning.maxReconnectAttempts) {
          this.scanning.error = 'Maximum reconnection attempts reached'
          this.stopScanning()
        }
      }
    },

    stopScanning() {
      if (this.scanning.abortController) {
        this.scanning.abortController.abort()
        this.scanning.abortController = null
      }
      this.scanning.isScanning = false
      this.scanning.error = null
      this.scanning.reconnectAttempts = 0
    },

    // Add debounced fetch records method
    debouncedFetchRecords: debounce(async function(this: any, sessionId: number) {
      await this.fetchRecords({ session: sessionId })
    }, 1000),

    async fetchRecordsBySessions(sessionIds: number[]) {
      this.isLoading = true
      this.error = ''
      let allRecords: AttendanceRecord[] = []
      try {
        for (const sessionId of sessionIds) {
          const response = await getAttendanceRecords({ session: sessionId })
          allRecords = allRecords.concat(response.data.results)
        }
        this.records = allRecords
        this.totalCount = allRecords.length
      } catch (e: any) {
        this.error = e.response?.data?.detail || 'Failed to fetch attendance records for sessions'
        console.error('Error fetching attendance records for sessions:', e)
      } finally {
        this.isLoading = false
      }
    }
  }
}) 