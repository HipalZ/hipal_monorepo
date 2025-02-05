"use client"

import { apiRpc } from "@hi/common"
import { FaArrowLeft } from "react-icons/fa";
import { formatDate } from "@/components/utils/helper";
import { lazy } from "react";
import { memo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Shield } from "lucide-react"
import { routeToDashboard } from "@/components/utils/routes";
import { useAddStaffStore } from "@/components/store/useAddStaffStore"
import { useNavigate } from "react-router-dom";
import { useOwnerLogin } from "@/components/store/useOwnerLogin"
import { useQuery } from "@tanstack/react-query"
import Hi from "@/assets/svg/hi.svg"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import NoStaff from "@/assets/noStaff.png"
import PopUp from "@/components/atom/popUp"
import toast from "react-hot-toast"
import type { CustomRole, UserProfile } from "@/components/types/businessData"
import useBusinessData from "@/components/store/useBusinessData"

const Header = lazy(() => import("@/components/molecules/header"));
const MotionButton = lazy(() => import("@/components/atom/motionButton"));
const NewAddStaff = lazy(() => import("@/components/molecules/addStaffpopup/addStaff"));
const EditStaff = lazy(() => import("@/components/molecules/addStaffpopup/editStaff"));

type Role = "MANAGER" | "CAPTAIN" | "MARKETING_AGENT" | "CO_OWNER"

const roleGradients = {
  MANAGER: "bg-blue-400",
  CAPTAIN: "bg-green-400",
  MARKETING_AGENT: "bg-yellow-400",
  CO_OWNER: "bg-gray-400",
}

const StaffPage = () => {
  const {
    setName,
    setPhone,
    setSelectedRole,
    setPermissionsBasedOnRole,
    setIsEditing,
    setEditStaffId,
    setPageToggle,
    setPermissions,
    setSelectedPermissions,
    isEditStaffOpen,
    setIsEditStaffOpen,
    isAddStaffOpen,
    setIsAddStaffOpen,
  } = useAddStaffStore();
  const navigate = useNavigate();
  const [staffDetails, setStaffDetails] = useState<UserProfile[]>([])
  const user = useOwnerLogin((s) => s.user)
  const businessData = useBusinessData((s) => s.businessData)

  const fetchPermissions = async () => {
    const res = await apiRpc.businesses[":businessId"].permissions.$get({
      param: {
        businessId: businessData?._id,
      },
    })
    const data = await res.json()
    if (res.status === 200 || res.status === 201) {
      setPermissions(data.data)
    } else {
      toast.error("Failed to fetch permissions")
    }
    return data.data
  }

  const handleStaffDetails = async (staff: UserProfile) => {
    const matchingData = staff.customRole.filter((item: CustomRole) => item.businessId === businessData?._id)
    const role = matchingData[0].role as Role
    setSelectedRole(role)
    setPermissionsBasedOnRole(staff.role)
    const permissionsData = await fetchPermissions()
    const userPermissions = permissionsData[role as keyof typeof permissionsData]
    setPermissions(userPermissions)
    setSelectedPermissions(userPermissions)
    setEditStaffId(staff._id)
    setName(staff.name)
    setPhone(staff.phone)
    setPageToggle("EDIT_STAFF")
    setIsEditing(true)
    setIsEditStaffOpen(true)
  }

  const closeEditModal = () => {
    setName("")
    setPhone("")
    setSelectedRole("")
    setPermissionsBasedOnRole("")
    setIsEditing(false)
    setEditStaffId("")
    setIsEditStaffOpen(false)
    setPageToggle("")
  }

  const addStaff = () => {
    setPageToggle("ADD_STAFF")
    setIsAddStaffOpen(true)
  }

  const getStaff = async () => {
    const res = await apiRpc.users[":businessId"].$get({
      param: {
        businessId: businessData?._id,
      },
    })

    const response = (await res.json()).data
    if (res.status === 200 || res.status === 201) {
      const filteredStaff = response?.filter((staff: UserProfile) => staff._id !== user._id)
      setStaffDetails(filteredStaff)
    }
    return response
  }
  const handleBack = () => {
    navigate(routeToDashboard(businessData?._id as string));
  };
  const { isLoading } = useQuery({
    queryKey: ["getStaffs", businessData?._id],
    queryFn: getStaff,
    enabled: !!businessData?._id,
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <main className="business_control_background">
      {/* Header */}
      <div className="w-full linear_gradient_background">
        <Header
          title="Staff"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
      </div>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-6 pb-[7rem]">
        <AnimatePresence>
          {staffDetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffDetails.map((staff: UserProfile, index) => (
                <motion.div
                  key={staff._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Hover Effect Background */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 group-hover:duration-200" />

                  <motion.button
                    onClick={() => handleStaffDetails(staff)}
                    className="relative w-full border bg-white/80 backdrop-blur-sm p-3 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
                    whileHover={{ y: -4 }}
                  >
                    {/* Header Section */}
                    <section className="flex items-start gap-5">
                      {/* Avatar */}
                      <article className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center overflow-hidden ring-1 ring-black/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-purple-50" />
                        <span className="relative text-xl capitalize font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          {staff.name.charAt(0)}
                        </span>
                      </article>

                      {/* Name and Primary Role */}
                      <div className="text-left space-y-1">
                        <h3 className="font-semibold capitalize text-xl group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300">
                          {staff.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div
                            className={`
                          scale-90 -ml-2 px-2 py-1 rounded-full text-sm font-medium shadow-lg 
                          text-white ${roleGradients[staff.customRole[0]?.role as Role] || roleGradients.CAPTAIN}
                        `}
                          >
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {staff.customRole[0]?.role}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Contact and Join Date */}
                    <section className="mt-3 flex items-center justify-between">
                      <article className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gray-50/80 group-hover:bg-white/80 transition-colors ring-1 ring-black/5">
                          <Phone className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{staff.phone}</span>
                      </article>
                      <article className="text-sm text-gray-500">
                        Joined {formatDate(staff?.createdAt)}
                      </article>
                    </section>

                    {/* Permissions Grid */}
                    <h1 className="font-semibold text-base">Access Permissions</h1>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {staff.customRole[0]?.permissions.map((permission, idx) => (
                        <div
                          key={idx?.toString()}
                          className={`p-3 rounded-xl ${permission.isHaveAccess
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-violet-50 text-violet-700 ring-1 ring-gray-100"
                            } transition-colors`}
                        >
                          <div className="flex items-center gap-2">
                            {permission.isHaveAccess ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 rounded-full bg-emerald-500"
                              />
                            ) : (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 rounded-full bg-violet-300"
                              />
                            )}
                            <span className="text-xs font-medium capitalize">
                              {permission.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-2xl" />
                <img
                  src={NoStaff}
                  alt="No Staff"
                  className="relative w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-2">No Team Members Yet</h2>
              <p className="text-gray-500 mb-8 text-center max-w-md">
                Start building your team by adding staff members. They'll appear here once added.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>


      {isAddStaffOpen && (
        <PopUp show={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)}>
          <NewAddStaff />
        </PopUp>
      )}

      {isEditStaffOpen && (
        <PopUp show={isEditStaffOpen} onClose={closeEditModal}>
          <EditStaff />
        </PopUp>
      )}

      <MotionButton onClick={addStaff} buttonName="Add Staff" type="button" />
    </main>
  )
}

const MemoizedStaff = memo(StaffPage)
export default MemoizedStaff

