from users.models import Users,Income,Expense,File
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core import serializers
import pytesseract
from PIL import Image
from transformers import AutoModelForCausalLM, AutoTokenizer

# Create your views here.
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def addIncome(request):
    userIns = request.user
    
    source = request.data['source'].lower()
    amount = request.data['amount'].lower()
    date = request.data['date'].lower()
    category = request.data['category'].lower()
    otherCategory = request.data['otherCategory'].lower()
    job = request.data['job'].lower()
    type = request.data['type'].lower()
    filesInput = request.FILES.getlist('files')
    category = category if category!= 'other' else otherCategory
    
    incomeIns = Income.objects.create(
        userid=userIns, 
        source=source, 
        amount=amount, 
        date=date, 
        category=category,
        job=job,
        typeInc=type,
    )
    
    for files in filesInput:
        filepath = f'{userIns.userid}/{files.name}'
        file_content = files.read()
        file_instance = File.objects.create(
            incomeid=incomeIns,
            filepath=filepath
        )
        
        file_instance.file.save(
            filepath,
            files,
            save=True
        )
                        
    return Response({"message": "Income added successfully"}, status=status.HTTP_200_OK)


@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def viewAllIncome(request):
    userIns = request.user
    income = Income.objects.filter(userid=userIns).order_by('-incomeid')

    income_data = []
    totalIncomeYear = {}
    monthlyIncomeByYear = {}
    category = {}

    for inc in income:
        year = str(inc.date).split('-')[0]
        month = str(inc.date).split('-')[1]
        amount = float(inc.amount)
        files = File.objects.filter(incomeid=inc.pk)
        file = [file.filepath for file in files]
        income_data.append({
            'id': inc.pk,
            'source': inc.source,
            'date': inc.date,
            'category': inc.category,
            'amount': str(inc.amount),
            'type': inc.typeInc,
            'job': inc.job,
            'file': file
        })
        if year not in totalIncomeYear:
            totalIncomeYear[year] = 0
            monthlyIncomeByYear[year] = {
                '01': 0, '02': 0, '03': 0, '04': 0,
                '05': 0, '06': 0, '07': 0, '08': 0,
                '09': 0, '10': 0, '11': 0, '12': 0
            }
            category[year] = {}
        if inc.category not in category[year]:
            category[year][inc.category] = 0
        category[year][inc.category] += amount
        totalIncomeYear[year] += amount
        monthlyIncomeByYear[year][month] += amount
        
            
    averageIncomeYear = {}
    averageIncomeYear1 = {}
    for year in totalIncomeYear:
        months_with_income = sum(1 for m in monthlyIncomeByYear[year].values() if m > 0)
        averageIncomeYear[year] = round(totalIncomeYear[year] / max(months_with_income, 1), 2)
        averageIncomeYear1[year] = round(totalIncomeYear[year] / 12, 2)
    
    return Response({
        "income":income_data,
        "totalIncome": totalIncomeYear,
        "averageIncome":averageIncomeYear,
        "averageIncome1":averageIncomeYear1,
        "monthly":monthlyIncomeByYear,
        "category":category,
    }, status=status.HTTP_200_OK)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def deleteIncome(request):
    userIns = request.user
    data = request.data

    id = data['incomeid']
    income = Income.objects.filter(userid=userIns, pk=id).first()
    income.delete()

    fileToDelete = File.objects.filter(incomeid=income.pk)
    fileToDelete.delete()

    return Response({"message": "Income deleted successfully"}, status=status.HTTP_200_OK)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def editIncome(request):
    userIns = request.user
    data = request.data

    id = request.data['id'].lower()
    source = request.data['source'].lower()
    amount = request.data['amount']
    date = request.data['date']
    category = request.data['category'].lower()
    otherCategory = request.data['otherCategory'].lower()
    job = request.data['job'].lower()
    type = request.data['type'].lower()

    category = category if category!= 'other' else otherCategory
    incomeIns = Income.objects.filter(userid=userIns, pk=id)
    incomeIns.update(source=source, amount=amount, date=date, category= category, job=job, typeInc=type)

    return Response({"message": "Income updated successfully"}, status=status.HTTP_200_OK)

def extractImage(image_path):
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    myconfig = r"--psm 6 --oem 3"
    # Extract text using pytesseract
    extract_text = pytesseract.image_to_string(Image.open(image_path), config=myconfig)

    return extract_text

model_name = "Qwen/Qwen3-0.6B"
global_tokenizer = None
global_model = None

def get_model_and_tokenizer():
    global global_tokenizer, global_model
    
    if global_tokenizer is None or global_model is None:
        global_tokenizer = AutoTokenizer.from_pretrained(model_name)
        global_model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype="auto",
            device_map="auto"
        )
    return global_tokenizer, global_model

def modelExtract(extracted_text):
    tokenizer, model = get_model_and_tokenizer()

    # prepare the model input
    prompt =f"""
    You are a tax deduction assistant.

    Analyze the receipt text provided and extract the following information in structured form:

    - Vendor Name
    - Date
    - Category (based on deduction type)
    - Sub-Category (specific deduction type)
    - Total Amount
    - Is Deductible (Yes/No)
    - Deduct amount

    Receipt Text:
    {extracted_text}

    Refer to the following deduction rules to decide if the expense is tax deductible:

    1. Self, Parents, Spouse
    - Individual relief (RM9000 fixed)
    - Medical expenses for parents (Max RM8000)
    - Spouse/alimony with no income or joint assessment (Max RM4000)

    2. Medical Expenses (Max RM10,000)
    - Serious disease, vaccination, fertility treatment
    - Medical/mental health checkups (RM1000 sub-limit)
    - Learning disability intervention (RM4000 sub-limit)

    3. Lifestyle
    - Books, electronics, internet, sports equipment, EV charging (Max RM2500)
    - Sports activities, entrance/competition fees (Max RM500)

    4. Education & Skills
    - Tuition fees in Malaysia (Max RM7000)
    - Upskilling/self-enhancement (RM2000 sub-limit)

    5. Parenthood
    - Breastfeeding equipment (Max RM1000)
    - Childcare fees (Max RM3000)
    - SSPN deposit (Max RM8000)
    - Fixed child relief (RM2000, RM8000 for tertiary)

    6. Insurance & Retirement
    - Life insurance (Max RM3000)
    - Voluntary EPF (Max RM4000)
    - PRS, annuity (Max RM3000)
    - Education/medical insurance (Max RM3000)
    - SOCSO (Max RM350)

    7. Disability
    - Equipment for disabled (Max RM6000)
    - Disabled self/spouse/child (RM6000–RM8000 fixed)

    8. Donations

    Your task:
    - Determine whether the expense is deductible.
    - If deductible, assign the most accurate *Category* and *Sub-Category* based on the rules below.
    - If the item doesn't clearly fit any category, *mark it as "Not Deductible"* and do not force a sub-category.

    Examples:
    - "iPad" → Lifestyle → Electronics
    - "RTK Test" → Medical Expenses → Medical check-up
    - "Tuition fees" → Education → Education fees
    - "Sports shoes" → Lifestyle → Sports activity

    Return your answer in this format:
    Structured Breakdown:
    - Vendor Name:
    - Date:
    - Category:
    - Sub-Category:
    - Total Amount:
    - Is Deductible:
    """
    messages = [
        {"role": "user", "content": prompt}
    ]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=True # Switches between thinking and non-thinking modes. Default is True.
    )
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

    # conduct text completion
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=32768
    )
    output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist() 

    try:
        index = len(output_ids) - output_ids[::-1].index(151668)
    except ValueError:
        index = 0

    thinking_content = tokenizer.decode(output_ids[:index], skip_special_tokens=True).strip("\n")
    content = tokenizer.decode(output_ids[index:], skip_special_tokens=True).strip("\n")

    return content

@api_view(['GET','POST'])
# @permission_classes([IsAuthenticated])
def extractFile(request):
    
    path = "C:\\Users\\USER\\Downloads\\receipt.png"
    extract_text = extractImage(path)
    content = modelExtract(extract_text)
    
    print(content)
    return Response({"incomeImage":content,"summary":[]}, status=status.HTTP_200_OK)
