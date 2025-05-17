from users.models import Users,Income,Expense,File,TaxUser
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
        
        if inc.typeInc.lower() == 'gain':
            category[year][inc.category] += amount
            totalIncomeYear[year] += amount
            monthlyIncomeByYear[year][month] += amount
        else:
            category[year][inc.category] -= amount
            totalIncomeYear[year] -= amount
            monthlyIncomeByYear[year][month] -= amount
    
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

