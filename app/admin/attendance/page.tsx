"use client";

import { useState, useEffect } from "react";
import { UserCheck, Clock, CheckCircle, MapPin, ShieldCheck, AlertTriangle, Crosshair, Sparkles, Lock, Timer, Loader2 } from "lucide-react";

// Exact Salon / Parlor Geofence Coordinates (Jaunpur Vivazen Parlor)
const PARLOR_LAT = 25.736503;
const PARLOR_LNG = 82.683213;
const GEOFENCE_RADIUS_METERS = 20; // 20-meter geofence perimeter around parlor

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Robust time-to-minutes converter handling 24h, 12h AM/PM, seconds, and locale strings
function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null;
  const str = String(timeStr).trim();
  const match = str.match(/(\d{1,2}):(\d{1,2})(?::\d{1,2})?\s*(am|pm)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toLowerCase();

  if (period === "pm" && hours < 12) {
    hours += 12;
  } else if (period === "am" && hours === 12) {
    hours = 0;
  }

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function getExactCurrentTime(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function AdminAttendancePage() {
  const today = new Date().toISOString().split("T")[0];

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "STAFF";
    permissions?: string[];
  } | null>(null);

  const [records, setRecords] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [liveTime, setLiveTime] = useState(getExactCurrentTime());
  const [filterDate, setFilterDate] = useState(today);
  const [loading, setLoading] = useState(true);

  // Button Loading States
  const [punchingId, setPunchingId] = useState<string | null>(null);
  const [geoChecking, setGeoChecking] = useState(false);
  const [geoResult, setGeoResult] = useState<{
    success: boolean;
    distance: number;
    message: string;
  } | null>(null);

  // Keep live time updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(getExactCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, attRes, stRes] = await Promise.all([
        fetch(`/api/auth/me`),
        fetch(`/api/crm/attendance?date=${filterDate}`),
        fetch(`/api/crm/staff`),
      ]);

      let loggedInUser: any = null;
      if (userRes.ok) {
        const uData = await userRes.json();
        if (uData.authenticated && uData.user) {
          loggedInUser = uData.user;
          setCurrentUser(uData.user);
        }
      }

      if (attRes.ok) {
        const d = await attRes.json();
        if (d.success) setRecords(d.data || []);
      }

      if (stRes.ok) {
        const d = await stRes.json();
        if (d.success) {
          const list: any[] = [];
          const allStaff = d.data?.staff || d.data?.providers || [];
          allStaff.forEach((p: any) => {
            const regDate = p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : (p.joiningDate || "2020-01-01");
            list.push({
              id: p.id,
              name: p.name,
              email: p.email || "",
              phone: p.phone || "",
              type: p.type || p.category || "Service Provider",
              attId: p.attendanceId,
              registrationDate: regDate,
            });
          });
          setStaff(list);

          // ─── STAFF SELF-LOCK ───
          // If logged in user is STAFF, automatically find and lock to their own profile
          if (loggedInUser && loggedInUser.role === "STAFF") {
            const myProfile = list.find(
              (s) =>
                (s.email && s.email.toLowerCase() === loggedInUser.email.toLowerCase()) ||
                s.name.toLowerCase() === loggedInUser.name.toLowerCase()
            );
            if (myProfile) {
              setSelectedStaff(myProfile.id);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterDate]);

  // Selected staff record for the filtered date
  const selectedRecord = records.find((r) => r.staffId === selectedStaff);

  // Calculate 1-hour cooldown status for a staff record
  const getCooldownInfo = (record: any) => {
    if (!record || !record.inTime) {
      return { hasInTime: false, isCompleted: false, canPunchOut: false, remainingMin: 0, eligibleTimeStr: "" };
    }
    if (record.outTime) {
      return { hasInTime: true, isCompleted: true, canPunchOut: false, remainingMin: 0, eligibleTimeStr: "" };
    }

    const inTotalMin = parseTimeToMinutes(record.inTime);
    const liveTotalMin = parseTimeToMinutes(liveTime);

    if (inTotalMin === null || liveTotalMin === null) {
      return { hasInTime: true, isCompleted: false, canPunchOut: false, remainingMin: 60, eligibleTimeStr: "" };
    }

    const diffMin = liveTotalMin - inTotalMin;
    const canPunchOut = diffMin >= 60;
    const remainingMin = Math.max(0, 60 - diffMin);

    const eligibleTotalMin = inTotalMin + 60;
    const eligibleH = Math.floor(eligibleTotalMin / 60) % 24;
    const eligibleM = eligibleTotalMin % 60;
    const eligibleTimeStr = `${String(eligibleH).padStart(2, "0")}:${String(eligibleM).padStart(2, "0")}`;

    return {
      hasInTime: true,
      isCompleted: false,
      canPunchOut,
      remainingMin,
      eligibleTimeStr,
    };
  };

  const selectedCooldown = getCooldownInfo(selectedRecord);

  // Check if current user is allowed to act on a given staff profile
  const canActOnStaff = (staffItem: any) => {
    if (!currentUser) return false;
    if (currentUser.role === "ADMIN" || currentUser.role === "MANAGER") return true;
    return (
      (staffItem.email && staffItem.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      staffItem.name.toLowerCase() === currentUser.name.toLowerCase()
    );
  };

  const punch = async (staffId: string, isOut: boolean) => {
    const s = staff.find((st) => st.id === staffId);
    if (!s) return;

    if (!canActOnStaff(s)) {
      return alert("Permission Denied: You can only punch attendance for your own account.");
    }

    if (filterDate < s.registrationDate) {
      return alert(
        `Attendance Restricted: Staff member ${s.name} was registered in database on ${s.registrationDate}. Attendance cannot be logged for dates prior to registration.`
      );
    }

    const record = records.find((r) => r.staffId === staffId);
    if (isOut) {
      const cd = getCooldownInfo(record);
      if (!cd.canPunchOut) {
        return alert(
          `⚠️ Out-Time Restricted: You can only punch Out-Time at least 1 hour after In-Time.\n\nIn-Time was at: ${record?.inTime}\nOut-Time available after: ${cd.eligibleTimeStr}\nRemaining wait time: ${cd.remainingMin} minutes.`
        );
      }
    }

    const currentPunchTime = getExactCurrentTime();
    setPunchingId(staffId);

    try {
      const payload: any = {
        staffId: s.id,
        staffName: s.name,
        type: s.type,
        date: filterDate,
        status: "Present",
      };
      if (isOut) {
        payload.outTime = currentPunchTime;
      } else {
        payload.inTime = currentPunchTime;
      }

      const res = await fetch("/api/crm/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to log attendance");
      } else {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPunchingId(null);
    }
  };

  // ─── GEOFENCE SELF-PUNCH HANDLER (< 20 METERS) ───
  const handleGeofenceSelfPunch = () => {
    if (!selectedStaff) return alert("Please select your staff profile first.");
    const s = staff.find((st) => st.id === selectedStaff);
    if (!s) return;

    if (!canActOnStaff(s)) {
      return alert("Permission Denied: You can only punch attendance for your own account.");
    }

    if (filterDate < s.registrationDate) {
      return alert(
        `Attendance Restricted: You were registered on ${s.registrationDate}. You cannot punch attendance for past dates prior to registration.`
      );
    }

    const cd = getCooldownInfo(selectedRecord);
    if (cd.isCompleted) {
      return alert(
        `Attendance Completed: Both In-Time (${selectedRecord.inTime}) and Out-Time (${selectedRecord.outTime}) have already been recorded for today.`
      );
    }

    if (cd.hasInTime && !cd.canPunchOut) {
      return alert(
        `⚠️ Out-Time Restricted: You can only punch Out-Time at least 1 hour after In-Time.\n\nIn-Time was logged at: ${selectedRecord?.inTime}\nOut-Time will unlock at: ${cd.eligibleTimeStr}\nRemaining wait time: ${cd.remainingMin} minutes.`
      );
    }

    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser/device.");
    }

    setGeoChecking(true);
    setGeoResult(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const distance = calculateDistanceInMeters(latitude, longitude, PARLOR_LAT, PARLOR_LNG);

        // Strict Geofence Check: Must be physically within GEOFENCE_RADIUS_METERS
        if (distance <= GEOFENCE_RADIUS_METERS) {
          const currentPunchTime = getExactCurrentTime();
          const isPunchingOut = Boolean(selectedRecord?.inTime && !selectedRecord?.outTime);

          const payload: any = {
            staffId: s.id,
            staffName: s.name,
            type: s.type,
            date: today,
            status: "Present",
          };

          if (isPunchingOut) {
            payload.outTime = currentPunchTime;
          } else {
            payload.inTime = currentPunchTime;
          }

          try {
            const res = await fetch("/api/crm/attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
              setGeoResult({
                success: true,
                distance,
                message: `✅Verified! You are within ${distance.toFixed(1)}m of Parlor Location. ${isPunchingOut ? "Out-Time" : "In-Time"} logged at ${currentPunchTime}.`,
              });
              await loadData();
            } else {
              setGeoResult({
                success: false,
                distance,
                message: `⚠️ ${data.error || "Failed to record attendance"}`,
              });
            }
          } catch (apiErr) {
            console.error(apiErr);
            setGeoResult({
              success: false,
              distance,
              message: "Network Error: Could not connect to server.",
            });
          } finally {
            setGeoChecking(false);
          }
        } else {
          setGeoChecking(false);
          // Outside Geofence
          const formattedDist =
            distance >= 1000
              ? `${(distance / 1000).toFixed(2)} km (${distance.toFixed(0)} meters)`
              : `${distance.toFixed(1)} meters`;
          setGeoResult({
            success: false,
            distance,
            message: `⚠️ Failed: You are currently ${formattedDist} away from the parlor.`,
          });
        }
      },
      (err) => {
        setGeoChecking(false);
        setGeoResult({
          success: false,
          distance: 999999,
          message: `Location Error: ${err.message}. Please allow location permission in your browser/device settings to verify physical presence.`,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const isStaffRole = currentUser?.role === "STAFF";

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
              Staff Daily Attendance Roster
            </h1>
            {isStaffRole && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <Lock size={10} /> Self-Attendance Mode
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Strict 2-punch attendance (In-Time &amp; Out-Time with 1-hour minimum cooldown) and {GEOFENCE_RADIUS_METERS}m Parlor Geofencing.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="crm-card py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Fetching attendance rosters and staff joining records...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Punch & Geofence Form */}
          <div className="crm-card space-y-5">
            <div className="flex items-center justify-between">
              <p className="section-title">Attendance Punch &amp; Geofencing</p>
              {isStaffRole && (
                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Lock size={10} /> Own Profile Only
                </span>
              )}
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="crm-label">Select Staff Personnel *</label>
                <select
                  disabled={isStaffRole || geoChecking || punchingId !== null}
                  className={`crm-select text-xs font-semibold ${isStaffRole ? "bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200" : ""}`}
                  value={selectedStaff}
                  onChange={(e) => {
                    setSelectedStaff(e.target.value);
                    setGeoResult(null);
                  }}
                >
                  <option value="">-- Choose Personnel --</option>
                  {staff.map((s) => {
                    const isSelf = isStaffRole && canActOnStaff(s);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.type}) - {s.attId} {isSelf ? "⭐ (You)" : ""}
                      </option>
                    );
                  })}
                </select>
                {selectedStaff && (
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                    📅 Registered in DB:{" "}
                    <span className="text-amber-900 font-bold">
                      {staff.find((st) => st.id === selectedStaff)?.registrationDate}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="crm-label mb-0">Punch Time (Live Clock)</label>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Auto (Locked)
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  className="crm-input text-xs font-mono font-bold bg-slate-100/90 text-slate-700 cursor-not-allowed border-slate-200 select-none"
                  value={liveTime}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  🔒 Time is automatically locked to the real-time clock to prevent manual edits.
                </p>
              </div>

              {/* Status Summary for Selected Staff */}
              {selectedStaff && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-600">Today's Punch Status:</span>
                    {selectedCooldown.isCompleted ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✅ Completed (2/2)
                      </span>
                    ) : selectedCooldown.hasInTime ? (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <Timer size={11} /> In-Time Marked (1/2)
                      </span>
                    ) : (
                      <span className="text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Pending In-Time (0/2)
                      </span>
                    )}
                  </div>

                  {selectedRecord?.inTime && (
                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200/60 font-mono">
                      <p>🟢 In-Time: <span className="font-bold text-emerald-800">{selectedRecord.inTime}</span></p>
                      {selectedRecord.outTime ? (
                        <p>🔴 Out-Time: <span className="font-bold text-rose-800">{selectedRecord.outTime}</span></p>
                      ) : (
                        <p className="text-amber-800 text-[10px] font-sans font-semibold">
                          ⏱️ Out-Time available after <span className="font-bold font-mono">{selectedCooldown.eligibleTimeStr}</span>
                          {!selectedCooldown.canPunchOut && ` (${selectedCooldown.remainingMin}m remaining)`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Geofence Button */}
              <div className="p-3 bg-gradient-to-br from-amber-50/70 to-emerald-50/50 rounded-xl border border-amber-200 space-y-2">
                {/* <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Crosshair size={13} className="text-amber-700" /> {GEOFENCE_RADIUS_METERS}m Geofence Punch
                  </span>
                  <span className="text-[10px] text-amber-900 font-black">GPS Verified</span>
                </div> */}

                <button
                  type="button"
                  onClick={handleGeofenceSelfPunch}
                  disabled={geoChecking || punchingId !== null || !selectedStaff || selectedCooldown.isCompleted || (selectedCooldown.hasInTime && !selectedCooldown.canPunchOut)}
                  className={`w-full text-xs py-2.5 rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-all ${selectedCooldown.isCompleted
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : selectedCooldown.hasInTime && !selectedCooldown.canPunchOut
                      ? "bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed"
                      : geoChecking
                        ? "bg-amber-600 text-white cursor-wait opacity-90"
                        : "btn-gold cursor-pointer"
                    }`}
                >
                  {geoChecking ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Verifying Location &amp; Logging...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={13} />
                      <span>
                        {selectedCooldown.isCompleted
                          ? "✅ Today's Attendance Completed"
                          : selectedCooldown.hasInTime && !selectedCooldown.canPunchOut
                            ? `⏳ Out-Time Locked until ${selectedCooldown.eligibleTimeStr} (${selectedCooldown.remainingMin}m)`
                            : selectedCooldown.hasInTime
                              ? "📍 Verify Location & Punch OUT-TIME"
                              : "📍 Verify Location & Punch IN-TIME"}
                      </span>
                    </>
                  )}
                </button>

                {geoResult && (
                  <div
                    className={`p-2.5 rounded-lg border text-[11px] font-semibold ${geoResult.success
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                      : "bg-rose-50 text-rose-900 border-rose-300"
                      }`}
                  >
                    {geoResult.message}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <p className="crm-label mb-3">Daily Attendance Metrics</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-xs font-semibold">Present Today</p>
                  <p className="text-xl font-black text-emerald-700 mt-0.5">{records.length}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-xs font-semibold">Total Staff</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{staff.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Direct Action Table */}
          <div className="lg:col-span-2 crm-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-title">Staff Roster for {filterDate}</p>
                <p className="text-[11px] text-slate-500">
                  Strict 2-punch system (In-Time &amp; Out-Time with 1-hour minimum duration threshold).
                </p>
              </div>
              <input
                type="date"
                className="crm-input text-xs py-1 px-2.5 w-36 font-bold"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              {staff.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-semibold text-sm">No Staff Registered</p>
                  <p className="text-slate-400 text-xs">Add service providers or staff members from the Team page.</p>
                </div>
              ) : (
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Staff Personnel</th>
                      <th>Category</th>
                      <th>Registered On</th>
                      <th>In-Time</th>
                      <th>Out-Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => {
                      const isNotYetRegistered = filterDate < s.registrationDate;
                      const record = records.find((r) => r.staffId === s.id);
                      const cd = getCooldownInfo(record);
                      const isAllowedUser = canActOnStaff(s);
                      const isPunchingThis = punchingId === s.id;
                      const isAnyActionBusy = punchingId !== null || geoChecking;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td>
                            <div className="flex items-center gap-1.5">
                              <div>
                                <p className="font-bold text-slate-800 text-xs">{s.name}</p>
                                <p className="font-mono text-[10px] text-amber-800">{s.attId}</p>
                              </div>
                              {isStaffRole && isAllowedUser && (
                                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-gray text-[10px]">{s.type}</span>
                          </td>
                          <td className="text-slate-500 font-mono text-xs">{s.registrationDate}</td>
                          <td className="text-emerald-700 font-mono font-bold text-xs">
                            {isNotYetRegistered ? "—" : record?.inTime || "-"}
                          </td>
                          <td className="text-rose-700 font-mono font-bold text-xs">
                            {isNotYetRegistered ? "—" : record?.outTime || "-"}
                          </td>
                          <td>
                            {isNotYetRegistered ? (
                              <span className="badge badge-gray text-[10px]" title={`Registered on ${s.registrationDate}`}>
                                Not Employed Yet
                              </span>
                            ) : record ? (
                              record.outTime ? (
                                <span className="badge badge-gray text-[10px]">Completed</span>
                              ) : (
                                <span className="badge badge-green text-[10px]">Present (In)</span>
                              )
                            ) : (
                              <span className="badge badge-lost text-[10px]">Absent</span>
                            )}
                          </td>
                          <td>
                            {isNotYetRegistered ? (
                              <span className="text-[10px] text-slate-400 italic">Pre-Joining</span>
                            ) : !isAllowedUser ? (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Lock size={10} /> Locked
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {!record && (
                                  <button
                                    onClick={() => punch(s.id, false)}
                                    disabled={isAnyActionBusy}
                                    className="btn-sm bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isPunchingThis ? (
                                      <>
                                        <Loader2 size={12} className="animate-spin text-emerald-800" />
                                        <span>Logging...</span>
                                      </>
                                    ) : (
                                      <span>Punch In</span>
                                    )}
                                  </button>
                                )}
                                {record && !record.outTime && (
                                  <button
                                    onClick={() => punch(s.id, true)}
                                    disabled={!cd.canPunchOut || isAnyActionBusy}
                                    title={!cd.canPunchOut ? `Out-Time available after ${cd.eligibleTimeStr} (${cd.remainingMin}m remaining)` : "Punch Out Time"}
                                    className={`btn-sm border font-bold flex items-center gap-1.5 ${cd.canPunchOut
                                      ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                                      }`}
                                  >
                                    {isPunchingThis ? (
                                      <>
                                        <Loader2 size={12} className="animate-spin text-rose-800" />
                                        <span>Logging...</span>
                                      </>
                                    ) : cd.canPunchOut ? (
                                      <span>Punch Out</span>
                                    ) : (
                                      <span>Out ({cd.remainingMin}m)</span>
                                    )}
                                  </button>
                                )}
                                {record && record.outTime && (
                                  <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                                    <CheckCircle size={12} /> Done
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
