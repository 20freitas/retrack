import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || !url.includes("vinted.")) {
      return NextResponse.json(
        { ok: false, error: "Invalid Vinted URL" },
        { status: 400 }
      );
    }

    // Fetch the Vinted page with full browser headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `Failed to fetch Vinted listing: ${response.status}` },
        { status: 500 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Debug: log the HTML length to see if we got content
    console.log("HTML length:", html.length);

    // Extract data from Vinted page
    let title = "";
    let image = "";
    let size = "";
    let condition = "";
    let description = "";

    // Try multiple selectors for title
    title = $('h1[itemprop="name"]').first().text().trim() ||
            $('h1.item-title').first().text().trim() ||
            $('h1.details-list__item-title').first().text().trim() ||
            $('h1').first().text().trim() ||
            $('meta[property="og:title"]').attr("content") ||
            $('title').first().text().split('|')[0].trim() || "";

    // Try multiple selectors for image
    image = $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            $('img[itemprop="image"]').first().attr("src") ||
            $('img.item-photo').first().attr("src") ||
            $('.item-photo img').first().attr("src") ||
            $('img[alt*="photo"]').first().attr("src") || "";

    // Try to find size and condition in specific detail sections only
    // Avoid buttons and UI elements
    $('div.details-list__item, div[class*="item-attributes"], table.details tr').each((_, el) => {
      const $el = $(el);
      const text = $el.text().toLowerCase();
      
      // Skip if it's a button or link
      if ($el.is('button') || $el.is('a') || $el.find('button, a').length > 0) {
        return;
      }
      
      // Skip if text contains common button words
      if (text.includes('enviar') || text.includes('message') || text.includes('comprar') || text.includes('buy')) {
        return;
      }
      
      const fullText = $el.text().trim();
      
      // Look for size
      if ((text.includes("size") || text.includes("tamanho") || text.includes("taille") || text.includes("talla")) && !size) {
        // Try to find the value part (usually after a colon or in a specific child element)
        const labelAndValue = fullText.split(/[:：]/);
        if (labelAndValue.length > 1) {
          const value = labelAndValue[1].trim();
          if (value && value.length < 20 && value.length > 0) {
            size = value;
          }
        } else {
          // Try finding in child elements
          const value = $el.find('span:last, td:last, dd').text().trim();
          if (value && value.length < 20 && !value.toLowerCase().includes('enviar')) {
            size = value;
          }
        }
      }
      
      // Look for condition
      if ((text.includes("condition") || text.includes("estado") || text.includes("état") || text.includes("condição")) && !condition) {
        const labelAndValue = fullText.split(/[:：]/);
        if (labelAndValue.length > 1) {
          const value = labelAndValue[1].trim();
          if (value && value.length < 50 && value.length > 0) {
            condition = value;
          }
        } else {
          const value = $el.find('span:last, td:last, dd').text().trim();
          if (value && value.length < 50 && !value.toLowerCase().includes('enviar')) {
            condition = value;
          }
        }
      }
    });

    // Try to find description
    description = $('div[itemprop="description"]').first().text().trim() ||
                  $('.item-description').first().text().trim() ||
                  $('div.item-details__description').first().text().trim() ||
                  $('meta[property="og:description"]').attr("content") || "";

    // If size is in description but not found separately, try to extract it
    if (!size && description) {
      const sizeMatch = description.match(/size[:\s]+([^\n,]+)/i) ||
                       description.match(/tamanho[:\s]+([^\n,]+)/i) ||
                       description.match(/talla[:\s]+([^\n,]+)/i);
      if (sizeMatch) size = sizeMatch[1].trim();
    }

    // Clean up captured data - remove common button/UI text
    const unwantedPhrases = ['enviar mensagem', 'send message', 'comprar', 'buy', 'adicionar', 'add to'];
    
    if (size) {
      const sizeLower = size.toLowerCase();
      if (unwantedPhrases.some(phrase => sizeLower.includes(phrase))) {
        size = ""; // Reset if it contains unwanted text
      }
    }
    
    if (condition) {
      const conditionLower = condition.toLowerCase();
      if (unwantedPhrases.some(phrase => conditionLower.includes(phrase))) {
        condition = ""; // Reset if it contains unwanted text
      }
    }
    
    const images = image ? [image] : [];
    
    // Log what we found for debugging
    console.log("Scraped data:", { title, image: !!image, size, condition });

    // Extract item ID from URL for fallback title
    const itemIdMatch = url.match(/items\/(\d+)/);
    const itemId = itemIdMatch ? itemIdMatch[1] : "";

    // If we didn't get enough data, try to extract from URL
    if (!title && url.includes("items/")) {
      const urlParts = url.split("/");
      const itemPart = urlParts.find((part: string) => part.includes("-"));
      if (itemPart) {
        title = itemPart
          .split("-")
          .slice(1) // Remove ID
          .join(" ")
          .split("?")[0] // Remove query params
          .replace(/[_-]/g, " ")
          .trim();
        // Capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }
    }

    // Build description from size if available, otherwise from description text
    let finalDescription = "";
    if (size) {
      finalDescription = `Size: ${size}`;
      if (description && description.length > 0) {
        finalDescription += `\n\n${description.substring(0, 150)}`;
      }
    } else if (description) {
      finalDescription = description.substring(0, 200);
    }

    const data = {
      title: title || `Vinted Item ${itemId}` || "Imported from Vinted",
      images,
      image, // backward compat
      size: size || "N/A",
      condition: condition || "used",
      description: finalDescription || "Imported from Vinted",
      date: new Date().toISOString().slice(0, 10),
      url,
      scraped: !!(title && image), // Flag to indicate if scraping was successful
    };

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error("Vinted import error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Import failed" },
      { status: 500 }
    );
  }
}
