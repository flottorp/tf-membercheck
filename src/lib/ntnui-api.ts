export interface MemberInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  membership_status?: string;
  [key: string]: any;
}

export interface ApiResponse {
  success: boolean;
  data?: MemberInfo;
  error?: string;
  status?: number;
}

/**
 * Checks membership status for a given phone number using NTNUI API
 */
export const checkMembership = async (
  phone: string, 
  password: string
): Promise<ApiResponse> => {
  try {
    const url = "https://api.ntnui.no/users/profile/";
    
    // Create basic auth header
    const auth = btoa(`${phone}:${password}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle different HTTP status codes
      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid credentials (phone number or password)',
          status: response.status
        };
      } else if (response.status === 403) {
        return {
          success: false,
          error: 'Access forbidden - user may not be a member',
          status: response.status
        };
      } else if (response.status === 404) {
        return {
          success: false,
          error: 'User not found',
          status: response.status
        };
      } else {
        return {
          success: false,
          error: `API request failed with status ${response.status}`,
          status: response.status
        };
      }
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      status: response.status
    };

  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Batch check membership for multiple phone numbers
 */
export const batchCheckMembership = async (
  phoneNumbers: string[],
  password: string,
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, ApiResponse>> => {
  const results = new Map<string, ApiResponse>();
  
  for (let i = 0; i < phoneNumbers.length; i++) {
    const phone = phoneNumbers[i];
    
    try {
      const result = await checkMembership(phone, password);
      results.set(phone, result);
    } catch (error) {
      results.set(phone, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress(i + 1, phoneNumbers.length);
    }
    
    // Add a small delay to avoid overwhelming the API
    if (i < phoneNumbers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};
