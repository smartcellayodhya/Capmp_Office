import pandas as pd
from supabase import create_client, Client

# 1. आपके असली Supabase क्रेडेंशियल्स
SUPABASE_URL = "https://afqzjhoasrnrczwmucem.supabase.co"
SUPABASE_KEY = "sb_publishable_9LRSwepb2L_AVcIKvmQ2Bw_6QzcJ_rd"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. आपकी Excel फाइल का नाम
excel_filename = "Master Data CA all.xlsx"

try:
    print(f"📂 Reading Excel file: {excel_filename}...")
    # सीधे Excel फाइल से 'Main Data Ideal Format' वाली शीट पढ़ रहे हैं
    df_main = pd.read_excel(excel_filename, sheet_name='Main Data Ideal Format')
except Exception as e:
    print(f"❌ Could not read the file. Please check the file name or sheet name. Error: {e}")
    exit()

# डेटा क्लीनिंग: खाली जगहों को हटाना और PNO को ठीक करना
df_main = df_main.fillna('')
df_main['पीएनओ'] = df_main['पीएनओ'].astype(str).str.replace(r'\.0$', '', regex=True)

# ---------------------------------------------------------
# फंक्शन 1: Officers Table में डेटा अपलोड करना
# ---------------------------------------------------------
def upload_officers_data():
    print("\n⏳ Uploading Officers Data...")
    officers_list = []
    
    for index, row in df_main.iterrows():
        # अगर PNO खाली है, तो उसे छोड़ दें
        if str(row['पीएनओ']).strip() == '' or str(row['पीएनओ']).lower() == 'nan':
            continue
            
        # Gazetted या Non-Gazetted तय करना
        rank = str(row['पद'])
        officer_tier = 'Gazetted' if rank in ['पुलिस उपाधीक्षक', 'सहा0पु0अधी0', 'अपर पुलिस अधीक्षक'] else 'Non-Gazetted'

        officers_list.append({
            "pno": str(row['पीएनओ']).strip(),
            "name": str(row['नाम']).strip(),
            "rank": rank,
            "officer_tier": officer_tier,
            "current_posting": str(row['वर्तमान नियुक्ति व दिनांक']).strip(),
            "caste_category": str(row.get('जाति श्रेणी (सामान्य,ओबीसी,एससी,एसटी )', 'Unknown')).strip(),
            "status": "Anumodit" if str(row.get('अनुमोदित', '')).strip() != '' else "Active"
        })
    
    # Supabase में एक साथ (Batch) इन्सर्ट करना
    if officers_list:
        try:
            # हम 50-50 के बैच में डेटा भेज रहे हैं
            batch_size = 50
            total_uploaded = 0
            for i in range(0, len(officers_list), batch_size):
                batch = officers_list[i:i+batch_size]
                supabase.table('officers').upsert(batch, on_conflict='pno').execute()
                total_uploaded += len(batch)
                print(f"   Uploaded {total_uploaded} / {len(officers_list)} officers...")
            print("✅ Main Officers data uploaded successfully!")
        except Exception as e:
            print(f"❌ Error uploading officers: {e}")

# ---------------------------------------------------------
# फंक्शन 2: Past Postings (पूर्व नियुक्तियां) अपलोड करना
# ---------------------------------------------------------
def upload_past_postings():
    print("\n⏳ Uploading Past Postings Data...")
    postings_list = []
    
    # 'पूर्व नियुक्तियां' शब्द वाले सभी कॉलम ढूँढें
    past_columns = [col for col in df_main.columns if 'पूर्व नियुक्तियां' in col]
    
    for index, row in df_main.iterrows():
        pno = str(row['पीएनओ']).strip()
        if pno == '' or pno.lower() == 'nan':
            continue
            
        for col in past_columns:
            posting_detail = str(row[col]).strip()
            if posting_detail != '' and posting_detail.lower() != 'nan':
                postings_list.append({
                    "officer_pno": pno,
                    "station_name": posting_detail
                })
                
    if postings_list:
        try:
            batch_size = 100
            total_uploaded = 0
            for i in range(0, len(postings_list), batch_size):
                batch = postings_list[i:i+batch_size]
                supabase.table('posting_history').insert(batch).execute()
                total_uploaded += len(batch)
                print(f"   Uploaded {total_uploaded} / {len(postings_list)} past postings...")
            print("✅ Past Postings data uploaded successfully!")
        except Exception as e:
            print(f"❌ Error uploading past postings: {e}")

# ---------------------------------------------------------
# स्क्रिप्ट को चलाना
# ---------------------------------------------------------
if __name__ == "__main__":
    upload_officers_data()
    upload_past_postings()
    print("\n🎉 All tasks completed successfully! Check your Supabase database.")