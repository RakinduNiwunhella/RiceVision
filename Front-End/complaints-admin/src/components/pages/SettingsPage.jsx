import { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

/* ---------- SHARED SWITCH STYLES ---------- */
const switchClass = `
  data-[state=checked]:bg-blue-600
  data-[state=unchecked]:bg-gray-300
  [&>span]:bg-white
  [&>span]:shadow
`;

/* ---------- PAGE ---------- */
export default function SettingsPage() {
  /* Account */
  const [fullName, setFullName] = useState("Admin User");

  /* Notifications */
  const [newComplaint, setNewComplaint] = useState(true);
  const [statusUpdated, setStatusUpdated] = useState(true);
  const [escalated, setEscalated] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage account, security, and notification preferences
        </p>
      </div>

      <Tabs>
        {/* Tabs */}
        <TabList className="flex gap-6 border-b mb-6">
          {["Account", "Security", "Notifications"].map((tab) => (
            <Tab
              key={tab}
              className="pb-2 text-sm cursor-pointer text-gray-500 outline-none"
              selectedClassName="text-blue-600 border-b-2 border-blue-600"
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        {/* ACCOUNT */}
        <TabPanel>
          <Card className="max-w-3xl border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle>Account Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value="admin@example.com" disabled />
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <Label>Role</Label>
                <Input value="Admin" disabled />
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        {/* SECURITY */}
        <TabPanel>
          <Card className="max-w-3xl border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
              <Input type="password" placeholder="Confirm password" />

              <div className="pt-4">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        {/* NOTIFICATIONS */}
        <TabPanel className="space-y-6">
          {/* Complaint Notifications */}
          <Card className="max-w-3xl border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle>Complaint Notifications</CardTitle>
            </CardHeader>

            <CardContent className="space-y-0">
              {[
                {
                  title: "New complaints",
                  desc: "When a new complaint is submitted",
                  state: newComplaint,
                  set: setNewComplaint,
                },
                {
                  title: "Status updates",
                  desc: "When complaint status changes",
                  state: statusUpdated,
                  set: setStatusUpdated,
                },
                {
                  title: "Escalations",
                  desc: "When a complaint is escalated",
                  state: escalated,
                  set: setEscalated,
                },
                {
                  title: "Weekly summary",
                  desc: "Weekly overview of complaint activity",
                  state: weeklySummary,
                  set: setWeeklySummary,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-4 ${
                    i !== 3 ? "border-b" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <Switch
                    checked={item.state}
                    onCheckedChange={item.set}
                    className={switchClass}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Channels */}
          <Card className="max-w-3xl border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle>Delivery Channels</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
                <Label>Email notifications</Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={inAppNotifications}
                  onCheckedChange={setInAppNotifications}
                />
                <Label>In-app notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}
