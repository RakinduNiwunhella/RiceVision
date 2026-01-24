import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Monitor, Smartphone, Tablet } from "lucide-react";

/* -------------------- MOCK DATA -------------------- */

const activeSessions = [
  {
    id: 1,
    device: "Windows Desktop",
    icon: Monitor,
    location: "New York, USA",
    lastActive: "Active now",
    current: true,
  },
  {
    id: 2,
    device: "iPhone 14",
    icon: Smartphone,
    location: "New York, USA",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: 3,
    device: "iPad Pro",
    icon: Tablet,
    location: "Boston, USA",
    lastActive: "1 day ago",
    current: false,
  },
];

export default function SettingsPage() {
  /* Account */
  const [fullName, setFullName] = useState("Admin User");
  const [email] = useState("admin@example.com");
  const [role] = useState("Admin");
  const [orgName, setOrgName] = useState("Acme Corporation");
  const [department, setDepartment] = useState("Customer Support");
  const [timezone, setTimezone] = useState("America/New_York");

  /* Security */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailLoginAlerts, setEmailLoginAlerts] = useState(true);

  /* Notifications */
  const [newComplaint, setNewComplaint] = useState(true);
  const [statusUpdated, setStatusUpdated] = useState(true);
  const [escalated, setEscalated] = useState(true);
  const [maintenance, setMaintenance] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  const handleSaveProfile = () => {
    console.log("Profile saved");
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Password updated");
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, security, and notification preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* ACCOUNT */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Input value={email} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <Label>Role</Label>
                <Input value={role} readOnly className="bg-muted" />
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <Input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button onClick={handleUpdatePassword}>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Two-Factor Authentication</Label>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Email Login Alerts</Label>
                <Switch
                  checked={emailLoginAlerts}
                  onCheckedChange={setEmailLoginAlerts}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Switch
                checked={newComplaint}
                onCheckedChange={setNewComplaint}
              />
              <Switch
                checked={statusUpdated}
                onCheckedChange={setStatusUpdated}
              />
              <Switch checked={escalated} onCheckedChange={setEscalated} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
                <Label>Email</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={inAppNotifications}
                  onCheckedChange={setInAppNotifications}
                />
                <Label>In-App</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
