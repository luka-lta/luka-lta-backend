import {FetchWrapper} from "@/lib/fetchWrapper.ts";

export type SiteConfigResponse = {
    webVitals?: boolean;
    trackErrors?: boolean;
    trackOutbound?: boolean;
    trackUrlParams?: boolean;
    trackInitialPageView?: boolean;
    trackSpaNavigation?: boolean;
    trackIp?: boolean;
    trackButtonClicks?: boolean;
    trackCopy?: boolean;
    trackFormInteractions?: boolean;
}

export type SiteResponse = {
    siteId: number;
    name: string;
    domain: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    organizationId: string | null;
    public: boolean;
    blockBots: boolean;
    // Analytics features
    siteConfig: SiteConfigResponse
};

export async function fetchSite(): Promise<SiteResponse> {
    const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);

    const response = await fetchWrapper.get('/site/1');

    return response.data.site
}