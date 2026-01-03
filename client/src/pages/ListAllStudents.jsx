import React, { useState, useEffect, useMemo } from "react";

import { InitialStudentForm, GenderOptions, ReligionOptions, ClassLabels, ClassOptions } from '../utils/studentConstants.js'
import { api } from "../utils/api";
import NavBar from "../components/NavBar";


export default function ListAllStudents() {
    const [loading, setLoading] = useState(false)
    const [students, setStudents] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    const [filters, setFilters] = useState({
        batchCategory: "",
        classGrade: "",
        version: "",
        group: "",
        gender: "",
        religion: "",
        residentialStatus: "",
        isUsingTransport: ""
    })

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({

            ...prev, [name]: value
        }))
    }
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            // Text Search 

            const query = searchTerm.toLowerCase().trim()

            const matchesSearch = !query ||
                [
                    student.userId?.name,
                    student.userId?.email,
                    student.userId?.mobile,
                    student.nameBN,
                    student.fatherName,
                    student.fatherNameBN,
                    student.motherName,
                    student.motherNameBN

                ].some(field => field?.toLowerCase().includes(query))


            // Drop-down filters 

            let matchesBatch = true
            if (filters.batchCategory) {
                const allowedClasses = ClassOptions[filters.batchCategory] || []
                matchesBatch = allowedClasses.includes(student.classGrade)
            }

            const matchesClass = filters.classGrade ? student.classGrade === filters.classGrade : true
            const matchesVersion = filters.version ? student.version === filters.version : true
            const matchesGroup = filters.group ? student.group === filters.group : true
            const matchesGender = filters.gender ? student.gender === filters.gender : true
            const matchesReligion = filters.religion ? student.religion === filters.religion : true
            const matchesResidentialStatus = filters.residentialStatus ? student.residentialStatus === filters.residentialStatus : true


            // Transport Boolean Conversion
            let matchesTransport = true
            if (filters.isUsingTransport !== "") {
                const isTrue = filters.isUsingTransport === 'true'
                matchesTransport = student.isUsingTransport === isTrue
            }

            // Match both Drop-Down and Search 

            return matchesSearch && matchesBatch && matchesClass && matchesVersion && matchesGroup && matchesGender && matchesReligion && matchesResidentialStatus && matchesTransport

        })
    }, [students, searchTerm, filters])

    const fetchStudents = async (forceRefresh = false) => {
        setLoading(true)
        try {

            // Recalling from cached version. 
            const cachedData = localStorage.getItem('cached_students')
            if (cachedData && !forceRefresh) {
                setStudents(JSON.parse(cachedData))
                setLoading(false)
                return
            }
            // Fetching and cached. 
            const response = await api.get('api/students/all')
            if (!response.ok) {
                throw new Error('Failed to fetch students')
            }
            const data = await response.json()
            setStudents(data.students)
            localStorage.setItem('cached_students', JSON.stringify(data.students))

        } catch (error) {
            console.error("Fetch Students Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [])


    // Searching and Filtering using useMemo hook. 






    return (
        <div className="student-list">
            <NavBar />
            <h2>Student List</h2>

            {
                students.length > 0 ?
                    (<>
                        <p>Total Students: {students.length}</p>

                        <table>
                            <thead>



                            </thead>
                        </table>


                    </>) :
                    (<p>No Students Found</p>)
            }
        </div>
    )
}