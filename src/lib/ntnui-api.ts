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
 * Checks membership status for a given phone number using TF Member API
 */
export const checkMembership = async (
  phone: string
): Promise<ApiResponse> => {
  try {
    const url = "/api/check-membership";
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone })
    });

    // Sjekk om response er tom
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      return {
        success: false,
        error: `Server returned non-JSON response: ${text.substring(0, 100)}`,
        status: response.status
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
        status: response.status
      };
    }

    return {
      success: true,
      data: data.data,
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
  onProgress?: (completed: number, total: number) => void,
  year?: number
): Promise<Map<string, ApiResponse>> => {
  const results = new Map<string, ApiResponse>();
  
  try {
    // Bruk batch endpoint for bedre ytelse
    const url = "/api/batch-check-membership";
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phones: phoneNumbers, year: year || new Date().getFullYear() })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Batch request failed:', response.status, text);
      throw new Error(`Batch request failed with status ${response.status}: ${text.substring(0, 100)}`);
    }

    // Sjekk om response er JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error('Non-JSON batch response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    
    // Konverter resultatene til Map
    phoneNumbers.forEach((phone, index) => {
      const phoneResult = data[phone];
      if (phoneResult) {
        results.set(phone, phoneResult);
      } else {
        results.set(phone, {
          success: false,
          error: 'No response for this phone number'
        });
      }
      
      // Oppdater progress
      if (onProgress) {
        onProgress(index + 1, phoneNumbers.length);
      }
    });
    
  } catch (error) {
    // Fallback til enkeltvis sjekk hvis batch feiler
    console.error('Batch check failed, falling back to individual checks:', error);
    
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phone = phoneNumbers[i];
      
      try {
        const result = await checkMembership(phone);
        results.set(phone, result);
      } catch (error) {
        results.set(phone, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
      
      if (onProgress) {
        onProgress(i + 1, phoneNumbers.length);
      }
      
      if (i < phoneNumbers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  return results;
};