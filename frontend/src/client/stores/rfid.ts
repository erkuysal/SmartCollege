import { defineStore } from 'pinia'
import { scanRFID, writeCard, markAttendance } from '../api'
import type { Student } from '../api'

interface ScannedStudent {
  student_number: string
  timestamp: string
  student?: Student
  is_new?: boolean
  uid?: string
  session_id?: number
  message?: string
}

let eventSource: EventSource | null = null;

export const useRfidStore = defineStore('rfid', {
  state: () => ({
    isReading: false,
    isWriting: false,
    isContinuousScanning: false,
    error: '',
    lastReadStudentNumber: null as string | null,
    lastWriteStatus: null as boolean | null,
    scannedStudents: [] as ScannedStudent[]
  }),

  actions: {
    async scanRFID() {
      this.isReading = true
      this.error = ''
      try {
        const response = await scanRFID()
        if (response.data.status === 'ok' && response.data.user_number && response.data.uid) {
          // The backend returns user_number which is the same as student_number
          this.lastReadStudentNumber = response.data.user_number
          // Add the scanned student to the list
          const scannedStudent = {
            student_number: response.data.user_number,
            uid: response.data.uid,
            timestamp: new Date().toISOString(),
            is_new: true
          }
          this.scannedStudents.push(scannedStudent)
          return scannedStudent
        } else {
          throw new Error(response.data.message || 'Invalid scan response')
        }
      } catch (e: any) {
        this.error = e.response?.data?.detail || 'Failed to read RFID card'
        console.error('Error reading RFID card:', e)
        throw e
      } finally {
        this.isReading = false
      }
    },

    async writeCard(studentNumber: string, userNumber: string) {
      this.isWriting = true
      this.error = ''
      try {
        const response = await writeCard({ user_number: userNumber })
        this.lastWriteStatus = response.data.status === 'ok'
        return response.data
      } catch (e: any) {
        this.error = e.response?.data?.detail || 'Failed to write to RFID card'
        console.error('Error writing to RFID card:', e)
        throw e
      } finally {
        this.isWriting = false
      }
    },

    async startContinuousScan(sessionId?: number) {
      this.resetState()
      this.isContinuousScanning = true
    
      // close any previous connection
      if (eventSource) eventSource.close()
    
      // open a true SSE connection
      const url = `http://127.0.0.1:8000/api/rfid/continuous/?continuous=true${sessionId ? `&session=${sessionId}` : ''}`
      console.log('[DEBUG] Starting continuous scan with sessionId:', sessionId, 'URL:', url)
      eventSource = new EventSource(url)
    
      eventSource.onopen = () => {
        console.log('[DEBUG] SSE connection opened')
      }
    
      eventSource.onmessage = (e) => {
        console.log('[DEBUG] Received SSE message:', e.data)
        if (!e.data || e.data.trim() === '') return
        try {
          const data = JSON.parse(e.data)
          console.log('[DEBUG] Parsed SSE data:', data)
          if (data.status === 'ok' && data.user_number) {
            const newStudent = {
              student_number: data.user_number,
              timestamp: data.timestamp,
              uid: data.uid,
              session_id: data.session_id,
              message: data.message,
              is_new: true
            }
            console.log('[DEBUG] Adding new student:', newStudent)
            this.scannedStudents.push(newStudent)
          }
          else if (data.status === 'error') {
            console.log('[DEBUG] Received error:', data.detail)
            this.error = data.detail
          }
          else if (data.action === 'stop_scan') {
            console.log('[DEBUG] Received stop_scan action')
            this.stopContinuousScan()
          }
        } catch (error) {
          console.error('[DEBUG] Error parsing SSE data:', error)
        }
      }
    
      eventSource.onerror = (err) => {
        console.error('[DEBUG] SSE error:', err)
        this.error = 'Lost connection to scanner'
        this.stopContinuousScan()
      }
    },

    async stopContinuousScan() {
      this.isContinuousScanning = false
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      // tell back-end to stop the Arduino loop
      fetch(`/api/rfid/continuous/?stop_scan=true`)  // still a GET per your curl
        .catch(e => console.error('stopScan error', e))
    },

    resetState() {
      this.lastReadStudentNumber = null
      this.lastWriteStatus = null
      this.error = ''
      this.scannedStudents = []
      this.isContinuousScanning = false
    }
  }
}) 