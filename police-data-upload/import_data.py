import pandas as pd
from supabase import create_client, Client

# 1. Supabase Credentials
SUPABASE_URL = "https://afqzjhoasrnrczwmucem.supabase.co"
SUPABASE_KEY = "sb_publishable_9LRSwepb2L_AVcIKvmQ2Bw_6QzcJ_rd"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

excel_filename = "Master Data CA all.xlsx"

try:
    print(f"📂 Reading Excel file: {excel_filename}...")
    xls = pd.ExcelFile(excel_filename)
    df_ngo = pd.read_excel(xls, sheet_name='Main Data Ideal Format')
    df_go = pd.read_excel(xls, sheet_name='Addl,Dysp detail NEW 13.5.25')
except Exception as e:
    print(f"❌ Error reading file: {e}")
    exit()

# ---------------------------------------------------------
# फंक्शन 1: Non-Gazetted Officers (Main Sheet) अपलोड करना
# ---------------------------------------------------------
def upload_ngo_data():
    print("\n⏳ Uploading Non-Gazetted Officers (NGOs)...")
    df_ngo_clean = df_ngo.fillna('')
    df_ngo_clean['पीएनओ'] = df_ngo_clean['पीएनओ'].astype(str).str.replace(r'\.0$', '', regex=True)
    
    officers_list = []
    for index, row in df_ngo_clean.iterrows():
        pno = str(row['पीएनओ']).strip()
        if pno == '' or pno.lower() == 'nan': continue
            
        officers_list.append({
            "pno": pno,
            "name": str(row['नाम']).strip(),
            "rank": str(row['पद']).strip(),
            "officer_tier": 'Non-Gazetted',
            "current_posting": str(row['वर्तमान नियुक्ति व दिनांक']).strip(),
            "caste_category": str(row.get('जाति श्रेणी (सामान्य,ओबीसी,एससी,एसटी )', 'Unknown')).strip(),
            "status": "Active"
        })
    
    if officers_list:
        for i in range(0, len(officers_list), 50):
            batch = officers_list[i:i+50]
            supabase.table('officers').upsert(batch, on_conflict='pno').execute()
        print(f"✅ {len(officers_list)} Non-Gazetted Officers uploaded!")

# ---------------------------------------------------------
# फंक्शन 2: Gazetted Officers (GO Sheet) अपलोड करना
# ---------------------------------------------------------
def upload_go_data():
    print("\n⏳ Uploading Gazetted Officers (GOs)...")
    df_go_clean = df_go.fillna('')
    
    go_list = []
    for index, row in df_go_clean.iterrows():
        name = str(row['नाम पुलिस उपाधीक्षक']).strip()
        if name == '' or name.lower() == 'nan': continue
        
        # PNO नहीं है, इसलिए हम GO_1, GO_2 बना रहे हैं
        mock_pno = f"GO_UPP_{index + 1}"
        
        posting = str(row['वर्तमान नियुक्ति स्थान']).strip()
        # पद का नाम नियुक्ति स्थान से तय करना
        rank = 'अपर पुलिस अधीक्षक' if 'अ0पु0अ0' in posting else 'पुलिस उपाधीक्षक'

        go_list.append({
            "pno": mock_pno,
            "name": name,
            "rank": rank,
            "officer_tier": 'Gazetted',
            "current_posting": posting,
            "caste_category": str(row.get('जाति/उपजाति', 'Unknown')).split('/')[0].strip(),
            "status": "Active"
        })
        
    if go_list:
        supabase.table('officers').upsert(go_list, on_conflict='pno').execute()
        print(f"✅ {len(go_list)} Gazetted Officers uploaded!")

# ---------------------------------------------------------
# फंक्शन 3: Past Postings (पूर्व नियुक्तियां) अपलोड करना
# ---------------------------------------------------------
def upload_past_postings():
    print("\n⏳ Uploading Past Postings Data...")
    df_ngo_clean = df_ngo.fillna('')
    df_ngo_clean['पीएनओ'] = df_ngo_clean['पीएनओ'].astype(str).str.replace(r'\.0$', '', regex=True)
    
    postings_list = []
    past_columns = [col for col in df_ngo_clean.columns if 'पूर्व नियुक्तियां' in col]
    
    for index, row in df_ngo_clean.iterrows():
        pno = str(row['पीएनओ']).strip()
        if pno == '' or pno.lower() == 'nan': continue
            
        for col in past_columns:
            posting_detail = str(row[col]).strip()
            if posting_detail != '' and posting_detail.lower() != 'nan':
                postings_list.append({
                    "officer_pno": pno,
                    "station_name": posting_detail
                })
                
    if postings_list:
        for i in range(0, len(postings_list), 100):
            batch = postings_list[i:i+100]
            supabase.table('posting_history').insert(batch).execute()
        print(f"✅ {len(postings_list)} Past Postings uploaded!")

# ---------------------------------------------------------
if __name__ == "__main__":
    upload_ngo_data()
    upload_go_data()
    upload_past_postings()
    print("\n🎉 ALL DONE! Your database is now completely perfect.")