// import {SiteSchema, SiteTypeSchema} from "@/feature/site-config/schema/SiteSchema.ts";
// import {useCallback, useState} from "react";
// import {Label} from "@/components/ui/label.tsx";
// import {Switch} from "@/components/ui/switch.tsx";
// import {Input} from "@/components/ui/input.tsx";
// import {Button} from "@/components/ui/button.tsx";
// import {
//     AlertDialog, AlertDialogAction, AlertDialogCancel,
//     AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger
// } from "@/components/ui/alert-dialog.tsx";
// import {AlertTriangle} from "lucide-react";
// import {IPExclusionManager} from "@/feature/site-config/components/IPExclusionManager.tsx";
// import {CountryExclusionManager} from "@/feature/site-config/components/CountryExclusionManager.tsx";
// import {toast} from "sonner";
// import {useMutation, useQueryClient} from "@tanstack/react-query";
// import {FetchWrapper} from "@/lib/fetchWrapper.ts";
//
// interface SiteConfigurationFieldProps {
//     siteMetadata: SiteTypeSchema
// }
//
// interface ToggleConfig {
//     id: string;
//     label: string;
//     description: string;
//     value: boolean;
//     key: keyof SiteTypeSchema;
//     enabledMessage?: string;
//     disabledMessage?: string;
// }
//
// function SiteConfigurationFields({siteMetadata}: SiteConfigurationFieldProps) {
//     const queryClient = useQueryClient();
//
//     const [newDomain, setNewDomain] = useState(siteMetadata.domain);
//     const [isDeleting, setIsDeleting] = useState(false);
//
//     const [toggleStates, setToggleStates] = useState({
//         public: siteMetadata.public || false,
//         blockBots: siteMetadata.blockBots || false,
//         webVitals: siteMetadata.siteConfig.webVitals || false,
//         trackErrors: siteMetadata.siteConfig.trackErrors || false,
//         trackOutbound: siteMetadata.siteConfig.trackOutbound ?? true,
//         trackUrlParams: siteMetadata.siteConfig.trackUrlParams ?? true,
//         trackInitialPageView: siteMetadata.siteConfig.trackInitialPageView ?? true,
//         trackSpaNavigation: siteMetadata.siteConfig.trackSpaNavigation ?? true,
//         trackIp: siteMetadata.trackIp ?? false,
//         trackButtonClicks: siteMetadata.siteConfig.trackButtonClicks ?? false,
//         trackCopy: siteMetadata.siteConfig.trackCopy ?? false,
//         trackFormInteractions: siteMetadata.siteConfig.trackFormInteractions ?? false,
//     });
//
//     const updateConfigMutation = useMutation({
//         mutationFn: async ({
//                                key,
//                                value
//                            }: {
//             key: keyof typeof toggleStates;
//             value: boolean
//         }) => {
//             const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
//             await fetchWrapper.post(`/site/${siteMetadata.siteId}/tracking-config`, {
//                 [key]: value
//             })
//         },
//         onSuccess: (data, { key, value }, context) => {
//             const message = getSuccessMessage(key, value);
//             toast.success(message);
//         },
//         onError: (error, { key }, context) => {
//             console.error(`Error updating ${key}:`, error);
//             toast.error(`Failed to update ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`);
//         },
//         onSettled: () => {
//             setTimeout(() => {
//                 queryClient.invalidateQueries({
//                     queryKey: ['site', 'configuration'],
//                 });
//             }, 500)
//         }
//     });
//
//     const getSuccessMessage = (
//         key: string,
//         checked: boolean,
//         customMessage?: { enabled: string; disabled: string }
//     ) => {
//         if (customMessage) {
//             return checked ? customMessage.enabled : customMessage.disabled;
//         }
//         return `${key.replace(/([A-Z])/g, " $1").toLowerCase()} ${checked ? "enabled" : "disabled"}`;
//     };
//
//     const handleToggle = useCallback(
//         (
//             key: keyof typeof toggleStates,
//             checked: boolean,
//             successMessage?: { enabled: string; disabled: string }
//         ) => {
//             updateConfigMutation.mutate({ key, value: checked });
//         },
//         [updateConfigMutation]
//     );
//
//     const handleDomainChange = async () => {
//         if (!newDomain?.trim()) {
//             toast.error('Domain cannot be empty');
//             return;
//         }
//
//         saveDomain.mutate();
//     };
//
//     const saveDomain = useMutation({
//         mutationFn: async () => {
//             const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
//             await fetchWrapper.post(`/site/${siteMetadata.siteId}/tracking-config`, {
//                 domain: newDomain
//             })
//         },
//         onSuccess: () => {
//             toast.success('Domain updated successfully!')
//         },
//         onError: (error) => {
//             console.error('Error changing domain:' + error);
//             toast.error('Failed to update Domain');
//         },
//         onSettled: () => {
//             setTimeout(() => {
//                 queryClient.invalidateQueries({
//                     queryKey: ['site', 'configuration'],
//                 });
//             }, 500)
//         }
//     })
//
//     const handleDelete = async () => {
//         console.log('Delete')
//     };
//
//     // Configuration for privacy & security toggles
//     const privacyToggles: ToggleConfig[] = [
//         {
//             id: "public",
//             label: "Public Analytics",
//             description: "Anyone can view your site analytics without logging in",
//             value: toggleStates.public,
//             key: "public",
//             enabledMessage: "Site analytics made public",
//             disabledMessage: "Site analytics made private",
//         },
//         {
//             id: "blockBots",
//             label: "Block Bot Traffic",
//             description: "Traffic from known bots and crawlers will not be tracked",
//             value: toggleStates.blockBots,
//             key: "blockBots",
//             enabledMessage: "Bot blocking enabled",
//             disabledMessage: "Bot blocking disabled",
//         },
//         {
//             id: "trackIp",
//             label: "Track IP Address",
//             description: "Track the IP address of the user. This is definitely not GDPR compliant!",
//             value: toggleStates.trackIp,
//             key: "trackIp",
//             enabledMessage: "IP address tracking enabled",
//             disabledMessage: "IP address tracking disabled",
//         },
//     ];
//
//    /* // Configuration for analytics feature toggles
//     const analyticsToggles: ToggleConfig[] = [
//         {
//             id: "webVitals",
//             label: "Web Vitals",
//             description: "Track Core Web Vitals metrics (LCP, CLS, INP, FCP, TTFB)",
//             value: toggleStates.webVitals,
//             key: "siteConfig.webVitals",
//             enabledMessage: "Web Vitals enabled",
//             disabledMessage: "Web Vitals disabled",
//         },
//         {
//             id: "trackSpaNavigation",
//             label: "SPA Navigation",
//             description: "Automatically track navigation in single-page applications",
//             value: toggleStates.trackSpaNavigation,
//             key: "trackSpaNavigation",
//             enabledMessage: "SPA navigation tracking enabled",
//             disabledMessage: "SPA navigation tracking disabled",
//         },
//         {
//             id: "trackUrlParams",
//             label: "URL Parameters",
//             description: "Include query string parameters in page tracking",
//             value: toggleStates.trackUrlParams,
//             key: "trackUrlParams",
//             enabledMessage: "URL parameters tracking enabled",
//             disabledMessage: "URL parameters tracking disabled",
//         },
//         {
//             id: "trackInitialPageView",
//             label: "Initial Page View",
//             description: "Automatically track the first page view when the script loads",
//             value: toggleStates.trackInitialPageView,
//             key: "trackInitialPageView",
//             enabledMessage: "Initial page view tracking enabled",
//             disabledMessage: "Initial page view tracking disabled",
//         },
//     ];
//
//     const autoCaptureToggles: ToggleConfig[] = [
//         {
//             id: "trackOutbound",
//             label: "Outbound Links",
//             description: "Track when users click on external links",
//             value: toggleStates.trackOutbound,
//             key: "trackOutbound",
//             enabledMessage: "Outbound tracking enabled",
//             disabledMessage: "Outbound tracking disabled",
//         },
//         {
//             id: "trackErrors",
//             label: "Error Tracking",
//             description: "Capture JavaScript errors and exceptions from your site",
//             value: toggleStates.trackErrors,
//             key: "siteConfig.",
//             enabledMessage: "Error tracking enabled",
//             disabledMessage: "Error tracking disabled",
//         },
//         {
//             id: "trackButtonClicks",
//             label: "Button Clicks",
//             description: "Automatically track clicks on all buttons",
//             value: toggleStates.trackButtonClicks,
//             key: "trackButtonClicks",
//             enabledMessage: "Button click tracking enabled",
//             disabledMessage: "Button click tracking disabled",
//         },
//         {
//             id: "trackCopy",
//             label: "Copy Events",
//             description: "Track when users copy text from your site",
//             value: toggleStates.trackCopy,
//             key: "trackCopy",
//             enabledMessage: "Copy tracking enabled",
//             disabledMessage: "Copy tracking disabled",
//         },
//         {
//             id: "trackFormInteractions",
//             label: "Form Interactions",
//             description: "Automatically track form submissions and input/select changes",
//             value: toggleStates.trackFormInteractions,
//             key: "trackFormInteractions",
//             enabledMessage: "Form interaction tracking enabled",
//             disabledMessage: "Form interaction tracking disabled",
//         },
//     ];*/
//
//     const renderToggleSection = (toggles: ToggleConfig[], title?: string) => (
//         <>
//             {title && <h4 className="text-sm font-semibold text-foreground">{title}</h4>}
//             {toggles.map(toggle => (
//                 <div key={toggle.id} className="flex items-center justify-between">
//                     <div>
//                         <Label htmlFor={toggle.id} className="text-sm font-medium text-foreground flex items-center gap-2">
//                             {toggle.label}
//                         </Label>
//                         <p className="text-xs text-muted-foreground mt-1">{toggle.description}</p>
//                     </div>
//                     <Switch
//                         id={toggle.id}
//                         checked={toggle.value}
//                         disabled={false}
//                         onCheckedChange={checked =>
//                             handleToggle(
//                                 toggle.key as keyof typeof toggleStates,
//                                 checked,
//                                 toggle.enabledMessage && toggle.disabledMessage
//                                     ? { enabled: toggle.enabledMessage, disabled: toggle.disabledMessage }
//                                     : undefined
//                             )
//                         }
//                     />
//                 </div>
//             ))}
//         </>
//     );
//
//     return (
//         <div className="pt-4 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
//             <div className="space-y-4">{renderToggleSection(privacyToggles, "Privacy & Security")}</div>
// {/*            <div className="space-y-4">{renderToggleSection(analyticsToggles, "Analytics Features")}</div>
//             <div className="space-y-4">{renderToggleSection(autoCaptureToggles, "Auto Capture")}</div>*/}
//             <IPExclusionManager siteId={siteMetadata.siteId} excludedIPsData={siteMetadata.excludedIps} />
//             <CountryExclusionManager siteId={siteMetadata.siteId} excludedCountriesData={siteMetadata.excludedCountries} />
//             <div className="space-y-3">
//                 <div>
//                     <h4 className="text-sm font-semibold text-foreground">Change Domain</h4>
//                     <p className="text-xs text-muted-foreground">Update the domain for this site</p>
//                 </div>
//                 <div className="flex space-x-2">
//                     <Input
//                         value={newDomain}
//                         onChange={e => setNewDomain(e.target.value.toLowerCase())}
//                         placeholder="example.com"
//                     />
//                     <Button
//                         variant="outline"
//                         onClick={handleDomainChange}
//                         disabled={saveDomain.isPending || newDomain === siteMetadata.domain}
//                     >
//                         {saveDomain.isPending ? "Updating..." : "Update"}
//                     </Button>
//                 </div>
//             </div>
//
//             {/* Danger Zone Section */}
//             <div className="space-y-3 pt-3">
//                 <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
//                 <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                         <Button variant="destructive">
//                             <AlertTriangle className="h-4 w-4" />
//                             Delete Site
//                         </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                         <AlertDialogHeader>
//                             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                             <AlertDialogDescription>
//                                 This action cannot be undone. This will permanently delete the site &quot;{siteMetadata.name}&quot; and
//                                 all of its analytics data.
//                             </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                             <AlertDialogCancel>Cancel</AlertDialogCancel>
//                             <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
//                                 {isDeleting ? "Deleting..." : "Yes, delete site"}
//                             </AlertDialogAction>
//                         </AlertDialogFooter>
//                     </AlertDialogContent>
//                 </AlertDialog>
//             </div>
//         </div>
//     );
// }
//
// export default SiteConfigurationFields;